"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import {
  CheckCircle2, CircleDashed, Store, ShieldCheck, TrendingUp,
  LineChart, Users, AlertCircle, PackagePlus, Building2, ArrowRight,
  Loader2, RefreshCw, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useStellarWallet } from "@/lib/stellar/context";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import Link from "next/link";

type BrandStats = {
  totalPools: number;
  activePools: number;
  totalOutlets: number;
  operatingOutlets: number;
  totalFunding: number;
  isApproved: boolean;
  isPending: boolean;
};

type PoolSummary = {
  id: string;
  name: string;
  location: string;
  status: string;
  targetFunding: number;
  collected: number;
  progress: number;
  investors: number;
  outlets: number;
};

type BrandInfo = {
  id: string;
  name: string;
  businessType: string;
  riskLevel: string;
  readinessScore: number | null;
  legalDocsCID: string | null;
  sopDocsCID: string | null;
  profileCompletedAt: string | null;
  nib: string | null;
  npwp: string | null;
  description: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Menunggu Review", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  PUBLISHED: { label: "Pooling Berlangsung", cls: "bg-purple-50 text-purple-700 border border-purple-200" },
  ACTIVE: { label: "Pooling Aktif", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  OPERATING: { label: "Outlet Beroperasi", cls: "bg-green-50 text-green-700 border border-green-200" },
  COMPLETED: { label: "Selesai", cls: "bg-gray-100 text-gray-600" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, publicKey, xlmBalance } = useStellarWallet();

  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [pools, setPools] = useState<PoolSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Get logged in user first
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      const ownerId = meData.user.id;

      // Fetch brand data
      const res = await fetch(`/api/dashboard/brand?ownerId=${ownerId}`);
      const data = await res.json();
      setBrand(data.brand);
      setStats(data.stats);
      setPools(data.pools || []);
    } catch (e) {
      console.error(e);
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

  // ── Not connected (Wait, now using JWT Auth instead of just Wallet) ──────────────
  // We can skip the Wallet prompt here if they are already logged in via email.
  // We handle unauthenticated state inside `load` by redirecting to /login.

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat dashboard…
      </div>
    );
  }

  // ── No brand yet ─────────────────────────────────────────────────────────────
  if (!brand) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Daftarkan Brand Anda</h2>
          <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
            Akun Anda belum memiliki brand. Daftarkan untuk mulai menggunakan platform.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/register-brand">
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <PackagePlus className="w-4 h-4" /> Daftarkan Brand
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending / onboarding state ───────────────────────────────────────────────
  if (stats && !stats.isApproved) {
    // Compute tasks from real data
    const tasks = [
      { label: "Brand berhasil didaftarkan", done: true, href: null },
      {
        label: "Lengkapi Profil Brand",
        done: !!brand.profileCompletedAt || !!(brand.description),
        href: "/profile/complete",
      },
      {
        label: "Upload Dokumen Pendukung",
        done: !!(brand.legalDocsCID || (brand.nib && brand.npwp)),
        href: "/profile/complete",
      },
      {
        label: "Verifikasi Brand",
        done: stats.isPending,
        href: null,
      },
      {
        label: "Brand Readiness Assessment",
        done: brand.readinessScore != null,
        href: null,
      },
      {
        label: "Disetujui Platform",
        done: stats.isApproved,
        href: null,
      },
    ];
    const completedTasks = tasks.filter((t) => t.done).length;
    const progressPercent = Math.round((completedTasks / tasks.length) * 100);

    return (
      <div className="max-w-[1200px] mx-auto flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {stats.isPending && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-semibold text-sm">Sedang Direview Platform</p>
                <p className="text-sm mt-0.5 text-amber-700/90">
                  Brand <strong>{brand.name}</strong> sedang diverifikasi tim. Estimasi: 2–5 hari kerja.
                </p>
              </div>
            </div>
          )}

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-700 shrink-0">
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{brand.name}</h2>
                  <p className="text-sm text-gray-500">{brand.businessType}</p>
                </div>
              </div>
              {!stats.isPending && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Brand Berhasil Didaftarkan</h3>
                    <p className="text-sm text-gray-600 mb-4">Lengkapi profil dan persyaratan untuk melanjutkan ke tahap berikutnya.</p>
                    <Link href="/profile/complete">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Lengkapi Profil Brand
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="xl:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Onboarding Checklist</h3>
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="text-gray-700">Progress</span>
                <span className="text-green-600">{progressPercent}% Selesai</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="space-y-3.5">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-3">
                  {task.done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    : <CircleDashed className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />}
                  {task.href && !task.done ? (
                    <Link href={task.href} className="text-sm font-medium text-blue-600 hover:underline">
                      {task.label} →
                    </Link>
                  ) : (
                    <span className={cn("text-sm font-medium", task.done ? "text-gray-900" : "text-gray-400")}>
                      {task.label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Wallet info */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Stellar Wallet</p>
              <a
                href={getStellarExpertUrl(publicKey!)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
              >
                {publicKey?.slice(0, 8)}…{publicKey?.slice(-6)}
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-gray-400 mt-1">{xlmBalance.toFixed(2)} XLM</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Approved dashboard ───────────────────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Welcome */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-green-100 to-blue-50 rounded-full opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-700">
                {brand.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{brand.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", {
                    MATURE: "bg-green-50 text-green-700",
                    MEZZANINE: "bg-blue-50 text-blue-700",
                    EMERGING: "bg-yellow-50 text-yellow-700",
                  }[brand.riskLevel] || "bg-gray-100 text-gray-600")}>
                    {brand.riskLevel}
                  </span>
                  {brand.readinessScore && (
                    <span className="text-xs text-gray-500">Score: {brand.readinessScore}/100</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm max-w-md">
              Brand Anda telah diverifikasi. Buat paket outlet untuk membuka peluang pendanaan dari investor.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Button
              onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-600/15"
            >
              <PackagePlus className="w-4 h-4" /> Buat Paket Outlet
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-gray-200 gap-1.5"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Paket Outlet", value: stats!.totalPools.toString(), icon: PackagePlus, color: "text-blue-600 bg-blue-50" },
          { label: "Paket Aktif", value: stats!.activePools.toString(), icon: Building2, color: "text-green-600 bg-green-50" },
          { label: "Total Outlet", value: stats!.totalOutlets.toString(), icon: Store, color: "text-purple-600 bg-purple-50" },
          {
            label: "Dana Terkumpul",
            value: stats!.totalFunding > 0 ? `Rp ${(stats!.totalFunding / 1e6).toFixed(1)}Jt` : "Rp 0",
            icon: TrendingUp,
            color: "text-orange-600 bg-orange-50",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pools */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Paket Outlet</h3>
          <Button
            onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-gray-200"
          >
            <PackagePlus className="w-3.5 h-3.5" /> Buat Paket
          </Button>
        </div>

        {pools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <PackagePlus className="w-12 h-12 text-gray-200 mb-3" />
            <h4 className="text-base font-semibold text-gray-900 mb-2">Belum Ada Paket Outlet</h4>
            <p className="text-sm text-gray-500 max-w-sm mb-5">
              Buat paket outlet untuk mendapatkan pendanaan dari investor.
            </p>
            <Button
              onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <PackagePlus className="w-4 h-4" /> Buat Paket Outlet
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pools.map((pool) => {
              const cfg = STATUS_CONFIG[pool.status] || { label: pool.status, cls: "bg-gray-100 text-gray-600" };
              return (
                <div key={pool.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">{pool.name}</h4>
                        <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", cfg.cls)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{pool.location}</p>
                    </div>
                    <Link href={`/dashboard/monitoring?status=approved`}>
                      <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-gray-700 h-8 text-xs flex-shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" /> Lihat Detail
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-gray-500">
                      Rp {(pool.collected / 1e6).toFixed(1)}Jt dari Rp {(pool.targetFunding / 1e6).toFixed(0)}Jt
                    </span>
                    <span className={cn("font-bold", pool.progress >= 100 ? "text-green-600" : "text-blue-600")}>
                      {pool.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", pool.progress >= 100 ? "bg-green-500" : "bg-blue-500")}
                      style={{ width: `${Math.max(2, pool.progress)}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span><span className="font-semibold text-gray-700">{pool.investors}</span> investor</span>
                    <span><span className="font-semibold text-gray-700">{pool.outlets}</span> outlet</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/dashboard/outlet?status=approved")}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Kelola Outlet</p>
              <p className="text-xs text-gray-500 mt-0.5">Lihat seluruh outlet aktif</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button
          onClick={() => router.push("/dashboard/monitoring?status=approved")}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-gray-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <LineChart className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Monitoring Pooling</p>
              <p className="text-xs text-gray-500 mt-0.5">Pantau pendanaan real-time</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
}
