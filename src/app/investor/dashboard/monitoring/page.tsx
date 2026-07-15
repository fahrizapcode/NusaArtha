"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Activity, TrendingUp, TrendingDown, Store, Loader2,
  AlertCircle, CheckCircle2, BarChart3, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type OutletData = {
  id: string;
  name: string;
  location: string;
  status: string;
  operatorName: string;
  todayRevenue: number;
  monthRevenue: number;
  lastMonthRevenue: number;
  totalRevenue: number;
  txCount: number;
  todayTxCount: number;
  recentTransactions: { amount: number; timestamp: string }[];
  performanceScore: {
    score: number;
    grade: string;
    status: string;
    notes: string[];
    riskFlag: boolean;
  };
};

type PoolData = {
  poolId: string;
  poolName: string;
  location: string;
  brandName: string;
  status: string;
  tokensOwned: number;
  totalSupply: number;
  myOwnershipPct: string;
  outlets: OutletData[];
  totalMonthRevenue: number;
  myMonthlyEstimate: number;
};

const GRADE_STYLE: Record<string, string> = {
  A: "bg-green-50 text-green-700 border-green-200",
  B: "bg-blue-50 text-blue-700 border-blue-200",
  C: "bg-yellow-50 text-yellow-700 border-yellow-200",
  D: "bg-orange-50 text-orange-700 border-orange-200",
  F: "bg-red-50 text-red-700 border-red-200",
};

export default function MonitoringPage() {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/investor/monitoring");
      if (res.ok) {
        const data = await res.json();
        setPools(data.pools || []);
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => loadData(true), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data monitoring…
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto text-center py-24">
        <Store className="w-14 h-14 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-700 mb-2">Belum ada investasi aktif</h2>
        <p className="text-sm text-gray-500">Beli token di marketplace untuk mulai memantau performa outlet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Monitoring Outlet</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Data POS real-time dari outlet yang Anda danai.{" "}
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Diperbarui {lastUpdate.toLocaleTimeString("id-ID")}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Pool",
            value: pools.length.toString(),
            icon: Store,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Outlet Aktif",
            value: pools.flatMap((p) => p.outlets).filter((o) => ["ACTIVE", "OPERATING"].includes(o.status.toUpperCase())).length.toString(),
            icon: Activity,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Rev. Bulan Ini",
            value: `Rp ${(pools.reduce((s, p) => s + p.totalMonthRevenue, 0) / 1e6).toFixed(1)}Jt`,
            icon: TrendingUp,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Est. Bagi Hasil",
            value: `Rp ${(pools.reduce((s, p) => s + p.myMonthlyEstimate, 0) / 1e6).toFixed(2)}Jt`,
            icon: BarChart3,
            color: "text-orange-600 bg-orange-50",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-lg font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Per pool */}
      {pools.map((pool) => (
        <div key={pool.poolId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Pool header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-900">{pool.poolName}</h2>
              <p className="text-xs text-gray-500">{pool.brandName} · {pool.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Kepemilikan Anda</p>
              <p className="font-bold text-gray-900">{pool.myOwnershipPct}%</p>
              <p className="text-xs text-gray-400">{pool.tokensOwned} / {pool.totalSupply} token</p>
            </div>
          </div>

          {/* Outlets */}
          <div className="divide-y divide-gray-50">
            {pool.outlets.map((outlet) => {
              const growth = outlet.lastMonthRevenue > 0
                ? ((outlet.monthRevenue - outlet.lastMonthRevenue) / outlet.lastMonthRevenue * 100)
                : 0;
              const isGrowthPositive = growth >= 0;

              return (
                <div key={`${pool.poolId}-${outlet.id}`} className="p-5">
                  {/* Outlet header */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Store className="w-4 h-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">{outlet.name}</h3>
                        {outlet.performanceScore.riskFlag && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                            ⚠ Risiko
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{outlet.location} · Operator: {outlet.operatorName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full border",
                        GRADE_STYLE[outlet.performanceScore.grade] || "bg-gray-100 text-gray-600 border-gray-200"
                      )}>
                        Grade {outlet.performanceScore.grade}
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {outlet.performanceScore.score}/100
                      </span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Hari ini</p>
                      <p className="text-sm font-bold text-gray-900">
                        Rp {(outlet.todayRevenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-[10px] text-gray-400">{outlet.todayTxCount} transaksi</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Bulan ini</p>
                      <p className="text-sm font-bold text-gray-900">
                        Rp {(outlet.monthRevenue / 1e6).toFixed(1)}Jt
                      </p>
                      <div className="flex items-center gap-1">
                        {isGrowthPositive
                          ? <TrendingUp className="w-3 h-3 text-green-600" />
                          : <TrendingDown className="w-3 h-3 text-red-500" />}
                        <span className={cn(
                          "text-[10px] font-semibold",
                          isGrowthPositive ? "text-green-600" : "text-red-500"
                        )}>
                          {isGrowthPositive ? "+" : ""}{growth.toFixed(1)}% MoM
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Total Transaksi</p>
                      <p className="text-sm font-bold text-gray-900">{outlet.txCount}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-[10px] text-blue-600 uppercase font-semibold mb-1">Est. Bagi Hasil</p>
                      <p className="text-sm font-bold text-blue-700">
                        Rp {(pool.myMonthlyEstimate / 1e6).toFixed(3)}Jt
                      </p>
                      <p className="text-[10px] text-blue-400">bulan ini</p>
                    </div>
                  </div>

                  {/* Performance notes */}
                  {outlet.performanceScore.notes.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
                      {outlet.performanceScore.notes.map((note, i) => (
                        <div key={`${outlet.id}-note-${i}`} className="flex items-start gap-2 text-xs text-amber-800">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          {note}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent transactions */}
                  {outlet.recentTransactions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Transaksi terakhir hari ini</p>
                      <div className="space-y-1.5">
                        {outlet.recentTransactions.map((tx, i) => (
                          <div key={`${tx.timestamp}-${i}`} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-500">
                              {new Date(tx.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="font-semibold text-gray-900">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {outlet.performanceScore.notes.length === 0 && outlet.performanceScore.score >= 70 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Outlet berperforma {outlet.performanceScore.status.toLowerCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
        <strong>Disclaimer:</strong> Data di atas berasal dari sistem POS dan merupakan indikator operasional. 
        Skor performa adalah alat bantu analisis, bukan jaminan keuntungan atau rekomendasi investasi. 
        Keputusan investasi sepenuhnya merupakan tanggung jawab investor.
      </div>
    </div>
  );
}
