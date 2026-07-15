"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, TrendingUp, Users, Store, MapPin, Clock,
  Loader2, ExternalLink, BarChart3, PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type PoolDetail = {
  id: string; name: string; location: string; status: string;
  targetFunding: number; totalSupply: number; pricePerToken: number;
  revenueShares: string; smartContractAddr?: string; disclosureCID?: string;
  brand: { name: string; riskLevel: string; readinessScore: number | null };
  investments: { id: string; tokensOwned: number; investor: { name: string | null; email: string } }[];
  outlets: {
    id: string; name: string; location: string; status: string;
    operator: { name: string | null; email: string } | null;
    posTransactions: { id: string; amount: number; timestamp: string }[];
  }[];
};

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poolId = searchParams.get("id");

  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [collected, setCollected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poolId) return;
    fetch(`/api/pools/${poolId}`)
      .then((r) => r.json())
      .then((d) => { setPool(d.pool); setCollected(d.collected || 0); setProgress(d.progress || 0); })
      .finally(() => setLoading(false));
  }, [poolId]);

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Memuat detail…
    </div>
  );
  if (!pool) return <div className="text-center py-24 text-gray-500">Data tidak ditemukan.</div>;

  const shares = (() => { try { return JSON.parse(pool.revenueShares); } catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; } })();
  const uniqueInvestors = new Set(pool.investments.map((i) => i.investor.email)).size;

  // Aggregate POS
  const allTx = pool.outlets.flatMap((o) => o.posTransactions);
  const now = new Date();
  const monthTx = allTx.filter((t) => new Date(t.timestamp).getMonth() === now.getMonth());
  const monthRevenue = monthTx.reduce((s, t) => s + t.amount, 0);
  const totalRevenue = allTx.reduce((s, t) => s + t.amount, 0);

  // Weekly chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now); day.setDate(day.getDate() - (6 - i)); day.setHours(0, 0, 0, 0);
    const next = new Date(day); next.setDate(next.getDate() + 1);
    const total = allTx.filter((t) => { const d = new Date(t.timestamp); return d >= day && d < next; }).reduce((s, t) => s + t.amount, 0);
    return { label: day.toLocaleDateString("id-ID", { weekday: "short" }), total };
  });
  const maxWeekly = Math.max(...weeklyData.map((d) => d.total), 1);

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali ke monitoring
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pool.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pool.brand.name} · <span className="flex items-center gap-1 inline-flex"><MapPin className="w-3 h-3" />{pool.location}</span></p>
            {pool.smartContractAddr && (
              <a href={getStellarExpertUrl(pool.smartContractAddr, "account")} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                <ExternalLink className="w-3 h-3" /> Stellar contract
              </a>
            )}
          </div>
          <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full uppercase flex-shrink-0",
            pool.status === "OPERATING" ? "bg-green-50 text-green-700" : pool.status === "PUBLISHED" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600")}>
            {pool.status}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Rp {(collected / 1e6).toFixed(1)}Jt dari Rp {(pool.targetFunding / 1e6).toFixed(0)}Jt</span>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(2, progress)}%` }} />
          </div>
          <div className="flex gap-5 mt-2 text-xs text-gray-500">
            <span><strong className="text-gray-900">{uniqueInvestors}</strong> investor</span>
            <span><strong className="text-gray-900">{pool.investments.length}</strong> investasi</span>
            <span><strong className="text-gray-900">{pool.outlets.length}</strong> outlet</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Revenue Bulan Ini", val: `Rp ${(monthRevenue / 1e6).toFixed(1)}Jt`, color: "text-green-600 bg-green-50" },
          { label: "Total Revenue", val: `Rp ${(totalRevenue / 1e6).toFixed(1)}Jt`, color: "text-blue-600 bg-blue-50" },
          { label: "Transaksi POS", val: allTx.length.toString(), color: "text-purple-600 bg-purple-50" },
          { label: "Skor Brand", val: `${pool.brand.readinessScore || 0}/100`, color: "text-orange-600 bg-orange-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.color)}>
              <BarChart3 className="w-[18px] h-[18px]" />
            </div>
            <p className="text-lg font-bold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /> Revenue 7 Hari Terakhir</h2>
          {allTx.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">Belum ada data POS</div>
          ) : (
            <>
              <div className="h-32 flex items-end gap-2 px-2">
                {weeklyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-400 rounded-t-sm relative group"
                      style={{ height: `${Math.max(4, (d.total / maxWeekly) * 100)}%`, minHeight: "4px" }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-1.5 rounded whitespace-nowrap z-10">
                        Rp {(d.total / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{d.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Revenue shares */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-400" /> Revenue Sharing</h2>
          <div className="space-y-3">
            {[
              { l: "Investor", p: shares.investor, c: "bg-blue-500" },
              { l: "Brand", p: shares.brand, c: "bg-green-500" },
              { l: "Operator", p: shares.operator, c: "bg-orange-400" },
              { l: "Platform", p: shares.platform, c: "bg-gray-400" },
            ].map((s) => (
              <div key={s.l}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{s.l}</span>
                  <span className="font-bold text-gray-900">{s.p}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", s.c)} style={{ width: `${s.p}%` }} />
                </div>
              </div>
            ))}
          </div>
          {monthRevenue > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Estimasi distribusi bulan ini:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 rounded-lg p-2"><p className="text-blue-600 font-semibold">Investor</p><p className="font-bold text-blue-800">Rp {(monthRevenue * 0.3 * shares.investor / 100 / 1e6).toFixed(2)}Jt</p></div>
                <div className="bg-green-50 rounded-lg p-2"><p className="text-green-600 font-semibold">Brand</p><p className="font-bold text-green-800">Rp {(monthRevenue * 0.3 * shares.brand / 100 / 1e6).toFixed(2)}Jt</p></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outlets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Store className="w-4 h-4 text-gray-400" /> Outlet ({pool.outlets.length})</h2>
        {pool.outlets.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada outlet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pool.outlets.map((outlet) => {
              const outletMonthRev = outlet.posTransactions
                .filter((t) => new Date(t.timestamp).getMonth() === now.getMonth())
                .reduce((s, t) => s + t.amount, 0);
              return (
                <div key={outlet.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{outlet.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{outlet.location}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md",
                      outlet.status === "OPERATING" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600")}>
                      {outlet.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Rev. Bulan Ini</p>
                      <p className="font-bold text-gray-900">Rp {(outletMonthRev / 1e6).toFixed(1)}Jt</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Operator</p>
                      <p className="font-bold text-gray-900 truncate">{outlet.operator?.name || "—"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Investor list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Investor ({pool.investments.length})</h2>
        {pool.investments.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada investor.</p>
        ) : (
          <div className="space-y-2">
            {pool.investments.slice(0, 10).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{inv.investor.name || inv.investor.email}</span>
                <span className="font-semibold text-gray-900">{inv.tokensOwned} token · {((inv.tokensOwned / pool.totalSupply) * 100).toFixed(2)}%</span>
              </div>
            ))}
            {pool.investments.length > 10 && <p className="text-xs text-gray-400 text-center pt-1">+{pool.investments.length - 10} investor lainnya</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 gap-3 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /></div>}>
      <DetailContent />
    </Suspense>
  );
}
