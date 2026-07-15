import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { BrandFilterTabs } from "./brand-filter-tabs";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-700",
  EMERGING: "bg-yellow-50 text-yellow-700",
  MEZZANINE: "bg-blue-50 text-blue-700",
  MATURE: "bg-green-50 text-green-700",
  HIGH_RISK: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu review",
  EMERGING: "Emerging",
  MEZZANINE: "Mezzanine",
  MATURE: "Mature / Disetujui",
  HIGH_RISK: "Ditolak",
};

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || "all";
  const q = params.q?.trim() || "";

  const brands = await prisma.brand.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { businessType: { contains: q } },
            { owner: { name: { contains: q } } },
            { owner: { email: { contains: q } } },
          ],
        }
      : undefined,
    include: { owner: true, pools: { select: { id: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    all: brands.length,
    pending: brands.filter((b) => b.riskLevel === "PENDING").length,
    approved: brands.filter((b) => ["MATURE", "MEZZANINE", "EMERGING"].includes(b.riskLevel)).length,
    rejected: brands.filter((b) => b.riskLevel === "HIGH_RISK").length,
  };

  const filteredBrands = filter === "all" ? brands
    : filter === "pending" ? brands.filter((b) => b.riskLevel === "PENDING")
    : filter === "approved" ? brands.filter((b) => ["MATURE", "MEZZANINE", "EMERGING"].includes(b.riskLevel))
    : filter === "rejected" ? brands.filter((b) => b.riskLevel === "HIGH_RISK")
    : brands;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Verifikasi brand</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola seluruh pengajuan brand. Total: <strong>{counts.all}</strong>
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <form method="GET" className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari brand..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 shadow-sm"
          />
          {params.filter && <input type="hidden" name="filter" value={params.filter} />}
        </form>
        <BrandFilterTabs counts={counts} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama brand</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Pemilik</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Skor</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBrands.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  Belum ada pengajuan brand.
                </td>
              </tr>
            )}
            {filteredBrands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900">{brand.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{brand.businessType}</td>
                <td className="px-5 py-4 text-gray-600 hidden md:table-cell">
                  {brand.owner?.name || brand.owner?.email || "—"}
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  {brand.readinessScore != null ? (
                    <span className={cn(
                      "text-xs font-bold",
                      brand.readinessScore >= 80 ? "text-green-600" :
                      brand.readinessScore >= 60 ? "text-yellow-600" : "text-red-500"
                    )}>
                      {brand.readinessScore}/100
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-500 hidden lg:table-cell text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(brand.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide",
                    STATUS_STYLES[brand.riskLevel] || "bg-gray-100 text-gray-600"
                  )}>
                    {STATUS_LABEL[brand.riskLevel] || brand.riskLevel}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/brands/${brand.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200">
                      Review <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
