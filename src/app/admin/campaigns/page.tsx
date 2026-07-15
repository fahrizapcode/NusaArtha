import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

import { CampaignFilterTabs } from "./campaign-filter-tabs";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-50 text-green-700",
  ACTIVE: "bg-blue-50 text-blue-700",
  OPERATING: "bg-indigo-50 text-indigo-700",
  COMPLETED: "bg-purple-50 text-purple-700",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Menunggu review",
  PUBLISHED: "Aktif",
  ACTIVE: "Aktif",
  OPERATING: "Beroperasi",
  COMPLETED: "Selesai",
};

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || "all";
  const q = params.q?.trim() || "";

  const pools = await prisma.investmentPool.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { location: { contains: q } },
            { brand: { name: { contains: q } } },
          ],
        }
      : undefined,
    include: {
      brand: { select: { name: true } },
      investments: { select: { tokensOwned: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    all: pools.length,
    review: pools.filter((p) => p.status === "DRAFT").length,
    active: pools.filter((p) => ["PUBLISHED", "ACTIVE"].includes(p.status)).length,
    operating: pools.filter((p) => p.status === "OPERATING").length,
  };

  const filteredPools = filter === "all" ? pools
    : filter === "review" ? pools.filter((p) => p.status === "DRAFT")
    : filter === "active" ? pools.filter((p) => ["PUBLISHED", "ACTIVE"].includes(p.status))
    : filter === "operating" ? pools.filter((p) => p.status === "OPERATING")
    : pools;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Campaign outlet</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola seluruh campaign outlet. Total: <strong>{counts.all}</strong>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <form method="GET" className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari outlet atau brand..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 shadow-sm"
          />
          {params.filter && <input type="hidden" name="filter" value={params.filter} />}
        </form>
        <CampaignFilterTabs counts={counts} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama outlet</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Brand</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Lokasi</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPools.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                  Belum ada campaign.
                </td>
              </tr>
            )}
            {filteredPools.map((pool) => {
              const collected = pool.investments.reduce(
                (s, i) => s + i.tokensOwned * pool.pricePerToken, 0
              );
              const progress = Math.min(100, Math.round((collected / pool.targetFunding) * 100));

              return (
                <tr key={pool.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900">{pool.name}</td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{pool.brand.name}</td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-xs">
                      <MapPin className="w-3 h-3" />{pool.location}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900 text-xs">
                    Rp {(pool.targetFunding / 1e6).toFixed(1)}Jt
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", progress >= 100 ? "bg-green-500" : "bg-blue-500")}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide",
                      STATUS_STYLES[pool.status] || "bg-gray-100 text-gray-600"
                    )}>
                      {STATUS_LABEL[pool.status] || pool.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(pool.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/campaigns/${pool.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200">
                        Review <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
