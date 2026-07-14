import { cn } from "@/lib/utils";
import { MapPin, Store, AlertCircle, HardHat, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  OPERATING: "bg-green-50 text-green-700",
  BUILDING: "bg-yellow-50 text-yellow-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  CLOSED: "bg-red-50 text-red-700",
  ISSUE: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Beroperasi",
  OPERATING: "Beroperasi",
  BUILDING: "Sedang Dibangun",
  PENDING: "Menunggu",
  CLOSED: "Ditutup",
  ISSUE: "Bermasalah",
};

export default async function AdminOutletsPage() {
  const outlets = await prisma.outlet.findMany({
    include: {
      operator: { select: { id: true, name: true, email: true } },
      pool: {
        select: {
          id: true,
          name: true,
          brand: { select: { name: true } },
          posTransactions: false,
        },
      },
      posTransactions: {
        orderBy: { timestamp: "desc" },
        take: 30,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute stats
  const total = outlets.length;
  const operating = outlets.filter((o) => ["ACTIVE", "OPERATING"].includes(o.status)).length;
  const building = outlets.filter((o) => ["BUILDING", "PENDING"].includes(o.status)).length;
  const issue = outlets.filter((o) => ["CLOSED", "ISSUE"].includes(o.status)).length;

  const STATS = [
    { label: "Total outlet", value: total, icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Outlet beroperasi", value: operating, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Outlet dibangun", value: building, icon: HardHat, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Outlet bermasalah", value: issue, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Monitoring outlet</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau seluruh outlet yang terdaftar di platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Outlet List */}
      {outlets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Store className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada outlet terdaftar</p>
          <p className="text-xs text-gray-400 mt-1">Outlet dibuat setelah campaign berhasil didanai.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => {
            const statusKey = outlet.status.toUpperCase();
            const monthlyRev = outlet.posTransactions
              .filter((t) => {
                const d = new Date();
                d.setDate(1); d.setHours(0, 0, 0, 0);
                return t.timestamp >= d;
              })
              .reduce((s, t) => s + t.amount, 0);

            return (
              <div key={outlet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", STATUS_STYLES[statusKey] || "bg-gray-50 text-gray-600")}>
                      {STATUS_LABEL[statusKey] || outlet.status}
                    </span>
                    {monthlyRev > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Omzet bulan ini</p>
                        <p className="text-xs font-bold text-green-600">Rp {(monthlyRev / 1e6).toFixed(1)}Jt</p>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg">{outlet.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{outlet.pool.brand.name} · {outlet.pool.name}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{outlet.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Store className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Op: {outlet.operator?.name || outlet.operator?.email || "Belum ditugaskan"}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                  <Link href={`/admin/outlets/${outlet.id}`} className="block">
                    <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 h-9 text-xs shadow-sm">
                      Lihat detail <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
