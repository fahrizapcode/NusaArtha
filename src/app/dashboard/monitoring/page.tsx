"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin, Users, Clock, ExternalLink, Package,
  Banknote, TrendingUp, Activity, Loader2, RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStellarWallet } from "@/lib/stellar/context";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import Link from "next/link";

type PoolSummary = {
  id: string;
  name: string;
  location: string;
  status: string;
  targetFunding: number;
  collected: number;
  progress: number;
  investors: number;
  smartContractAddr?: string;
  endDate?: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Menunggu Review", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  PUBLISHED: { label: "Pooling Berlangsung", cls: "bg-purple-50 text-purple-700 border border-purple-200" },
  ACTIVE: { label: "Pooling Aktif", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  OPERATING: { label: "Outlet Beroperasi", cls: "bg-green-50 text-green-700 border border-green-200" },
  COMPLETED: { label: "Selesai", cls: "bg-gray-100 text-gray-600" },
};

export default function MonitoringPage() {
  const router = useRouter();
  const { publicKey } = useStellarWallet();
  const [pools, setPools] = useState<PoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const me = await meRes.json();
      const res = await fetch(`/api/dashboard/brand?ownerId=${me.user.id}`);
      const data = await res.json();
      setPools(data.pools || []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Summary stats
  const totalTarget = pools.reduce((s, p) => s + p.targetFunding, 0);
  const totalCollected = pools.reduce((s, p) => s + p.collected, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;
  const activePools = pools.filter((p) => ["PUBLISHED", "ACTIVE"].includes(p.status)).length;

  const SUMMARY_CARDS = [
    { label: "Total Paket Aktif", value: activePools.toString(), icon: Package, color: "text-blue-600 bg-blue-50" },
    {
      label: "Dana Terkumpul",
      value: totalCollected > 0 ? `Rp ${(totalCollected / 1e6).toFixed(1)}Jt` : "Rp 0",
      icon: Banknote,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Target Pendanaan",
      value: totalTarget > 0 ? `Rp ${(totalTarget / 1e6).toFixed(0)}Jt` : "Rp 0",
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Persentase Pendanaan",
      value: `${overallProgress}%`,
      icon: Activity,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Monitoring Pooling</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau seluruh proses pendanaan outlet secara real-time.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-1.5 border-gray-200 text-gray-600 self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Package Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Semua Paket ({pools.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data…
          </div>
        ) : pools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
            Belum ada paket outlet.
          </div>
        ) : (
          pools.map((pkg) => {
            const cfg = STATUS_CONFIG[pkg.status] || { label: pkg.status, cls: "bg-gray-100 text-gray-600" };
            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", cfg.cls)}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {pkg.location}
                    </div>
                    {pkg.smartContractAddr && (
                      <a
                        href={getStellarExpertUrl(pkg.smartContractAddr, "account")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Stellar Contract
                      </a>
                    )}
                  </div>
                  <Link href={`/dashboard/monitoring/detail?id=${pkg.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-gray-700 h-8 text-xs flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" /> Lihat Detail
                    </Button>
                  </Link>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-gray-900">
                        Rp {(pkg.collected / 1e6).toFixed(1)}Jt
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        dari Rp {(pkg.targetFunding / 1e6).toFixed(0)}Jt
                      </span>
                    </div>
                    <span className={cn("text-sm font-bold", pkg.progress >= 100 ? "text-green-600" : "text-blue-600")}>
                      {pkg.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", pkg.progress >= 100 ? "bg-green-500" : "bg-blue-500")}
                      style={{ width: `${Math.max(2, pkg.progress)}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span><span className="font-semibold text-gray-700">{pkg.investors}</span> Investor</span>
                  </div>
                  {pkg.progress >= 100 ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">Pendanaan selesai</span>
                    </div>
                  ) : pkg.endDate ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {(() => {
                        const daysLeft = Math.max(0, Math.ceil((new Date(pkg.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                        return (
                          <span>Sisa <span className={cn("font-semibold", daysLeft <= 7 ? "text-orange-600" : "text-gray-700")}>{daysLeft}</span> hari</span>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Tidak ada batas waktu</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
