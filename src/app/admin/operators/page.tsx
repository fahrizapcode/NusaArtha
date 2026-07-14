import { cn } from "@/lib/utils";
import { ChevronRight, Store, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  TRAINING: "bg-blue-50 text-blue-700",
  REVIEW: "bg-orange-50 text-orange-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

export default async function AdminOperatorsPage() {
  const operators = await prisma.user.findMany({
    where: { role: "OPERATOR" },
    include: {
      operatedOutlets: {
        include: {
          pool: { select: { brand: { select: { name: true } } } },
          posTransactions: { orderBy: { timestamp: "desc" }, take: 30 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Operator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola dan pantau kinerja seluruh operator pengelola outlet.
          Total: <strong>{operators.length}</strong>
        </p>
      </div>

      {operators.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Store className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada operator terdaftar</p>
          <p className="text-xs text-gray-400 mt-1">
            Operator mendaftar melalui halaman registrasi dengan role OPERATOR.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama operator</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Brand mitra</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Outlet dikelola</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaksi bulan ini</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {operators.map((op) => {
                const outletCount = op.operatedOutlets.length;
                const brandNames = [...new Set(op.operatedOutlets.map((o) => o.pool.brand.name))].join(", ");

                // Monthly transactions
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthlyTxCount = op.operatedOutlets.reduce((s, outlet) => {
                  return s + outlet.posTransactions.filter((t) => t.timestamp >= monthStart).length;
                }, 0);
                const monthlyRevenue = op.operatedOutlets.reduce((s, outlet) => {
                  return s + outlet.posTransactions
                    .filter((t) => t.timestamp >= monthStart)
                    .reduce((r, t) => r + t.amount, 0);
                }, 0);

                // Simple score based on activity
                const hasOutlets = outletCount > 0;
                const statusKey = hasOutlets ? "ACTIVE" : "INACTIVE";

                return (
                  <tr key={op.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {(op.name || op.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">{op.name || "—"}</span>
                          <p className="text-xs text-gray-400">{op.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden md:table-cell">
                      {brandNames || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        {outletCount} outlet
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {monthlyTxCount > 0 ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{monthlyTxCount} transaksi</p>
                          <p className="text-[10px] text-green-600">Rp {(monthlyRevenue / 1e6).toFixed(1)}Jt</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", STATUS_STYLES[statusKey])}>
                        {statusKey === "ACTIVE" ? "Aktif" : "Belum aktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/operators/${op.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200">
                          Lihat <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
