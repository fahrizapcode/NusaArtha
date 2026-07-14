import { Store, Megaphone, ShieldCheck, Wallet, TrendingUp, Users } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const [totalBrands, totalPools, activePools, operatingPools, totalOutlets, totalInvestors, allInvestments, posTransactions] =
    await Promise.all([
      prisma.brand.count(),
      prisma.investmentPool.count(),
      prisma.investmentPool.count({ where: { status: { in: ["PUBLISHED", "ACTIVE"] } } }),
      prisma.investmentPool.count({ where: { status: "OPERATING" } }),
      prisma.outlet.count(),
      prisma.user.count({ where: { role: "INVESTOR" } }),
      prisma.investment.findMany({ include: { pool: { select: { pricePerToken: true } } } }),
      prisma.posTransaction.findMany({ orderBy: { timestamp: "desc" }, take: 500 }),
    ]);

  const totalFunding = allInvestments.reduce((s, i) => s + i.tokensOwned * i.pool.pricePerToken, 0);

  // Build 7-month revenue from POS
  const now = new Date();
  const monthlyRevenue = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const total = posTransactions.filter((t) => t.timestamp >= start && t.timestamp < end).reduce((s, t) => s + t.amount, 0);
    return { label: start.toLocaleString("id-ID", { month: "short" }), value: total };
  });
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1);

  const draftPools = totalPools - activePools - operatingPools;

  const STAT_CARDS = [
    { label: "Total brand", value: totalBrands, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total campaign", value: totalPools, icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Campaign aktif", value: activePools, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total outlet", value: totalOutlets, icon: Store, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total investor", value: totalInvestors, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    {
      label: "Dana dihimpun",
      value: totalFunding > 0 ? `Rp ${(totalFunding / 1e6).toFixed(0)}Jt` : "Rp 0",
      icon: Wallet,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  const statusBreakdown = [
    { label: "Draft / Menunggu review", count: draftPools, color: "bg-gray-300" },
    { label: "Aktif (Published / Active)", count: activePools, color: "bg-blue-400" },
    { label: "Beroperasi", count: operatingPools, color: "bg-green-500" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Statistik platform dari data aktual database.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue POS Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="font-bold text-gray-900">Revenue POS (7 bulan terakhir)</h2>
            <p className="text-xs text-gray-500">Data aktual dari transaksi outlet</p>
          </div>
          {posTransactions.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
              Belum ada data transaksi POS
            </div>
          ) : (
            <>
              <div className="h-48 w-full flex items-end justify-between px-2 gap-2">
                {monthlyRevenue.map((m, i) => {
                  const pct = (m.value / maxRevenue) * 100;
                  return (
                    <div key={i} className="w-full bg-teal-100 rounded-t-sm relative group" style={{ height: `${Math.max(pct, 3)}%` }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap z-10">
                        Rp {(m.value / 1e6).toFixed(1)}Jt
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-2 font-medium">
                {monthlyRevenue.map((m) => <span key={m.label}>{m.label}</span>)}
              </div>
            </>
          )}
        </div>

        {/* Campaign status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-6">Status campaign</h2>
          <div className="space-y-5">
            {statusBreakdown.map((s) => {
              const pct = totalPools > 0 ? Math.round((s.count / totalPools) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 font-medium">{s.label}</span>
                    <span className="font-bold text-gray-900">{s.count}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-6">Total: {totalPools} campaign</p>
        </div>
      </div>
    </div>
  );
}
