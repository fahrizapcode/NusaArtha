"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin, Users, ArrowLeft, CheckCircle2, CircleDashed,
  Clock, Banknote, TrendingUp, ExternalLink, Loader2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import Link from "next/link";

type PoolDetail = {
  id: string;
  name: string;
  location: string;
  status: string;
  targetFunding: number;
  pricePerToken: number;
  totalSupply: number;
  smartContractAddr?: string;
  disclosureCID?: string;
  brand: { name: string };
  investments: { id: string; tokensOwned: number; investor: { walletAddress: string | null; name: string | null } }[];
  outlets: { id: string; name: string; status: string }[];
};

const TIMELINE_STAGES = [
  { key: "DRAFT", label: "Paket Dipublikasikan" },
  { key: "PUBLISHED", label: "Pendanaan Berlangsung" },
  { key: "ACTIVE", label: "Target Tercapai" },
  { key: "OPERATING", label: "Outlet Beroperasi" },
  { key: "COMPLETED", label: "Proyek Selesai" },
];

const STATUS_ORDER = ["DRAFT", "PUBLISHED", "ACTIVE", "OPERATING", "COMPLETED"];

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const poolId = searchParams.get("id");

  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [collected, setCollected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poolId) { setLoading(false); return; }
    fetch(`/api/pools/${poolId}`)
      .then((r) => r.json())
      .then((d) => {
        setPool(d.pool);
        setCollected(d.collected || 0);
        setProgress(d.progress || 0);
      })
      .finally(() => setLoading(false));
  }, [poolId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data…
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">Paket tidak ditemukan.</p>
        <Button onClick={() => router.back()} variant="outline">Kembali</Button>
      </div>
    );
  }

  const uniqueInvestors = new Set(pool.investments.map((i) => i.investor.walletAddress)).size;
  const currentStageIdx = STATUS_ORDER.indexOf(pool.status);

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Monitoring
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left */}
        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{pool.name}</h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {pool.location}
                </div>
                <p className="text-xs text-gray-400 mt-1">{pool.brand.name}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                  {pool.status}
                </span>
                {pool.smartContractAddr && (
                  <a
                    href={getStellarExpertUrl(pool.smartContractAddr, "account")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Stellar
                  </a>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: TrendingUp, label: "Target Dana", val: `Rp ${(pool.targetFunding / 1e6).toFixed(0)}Jt` },
                { icon: Banknote, label: "Terkumpul", val: `Rp ${(collected / 1e6).toFixed(1)}Jt`, blue: true },
                { icon: Users, label: "Investor", val: `${uniqueInvestors} orang` },
                { icon: Clock, label: "Sisa Waktu", val: progress >= 100 ? "Selesai" : "30 hari" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                  </div>
                  <p className={cn("text-base font-bold", item.blue ? "text-blue-700" : "text-gray-900")}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">Progress Pendanaan</span>
                <span className={cn("text-2xl font-bold", progress >= 100 ? "text-green-600" : "text-blue-600")}>
                  {progress}%
                </span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-green-500" : "bg-blue-600")}
                  style={{ width: `${Math.max(2, progress)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Investors list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Daftar Investor ({pool.investments.length})
            </h2>
            {pool.investments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Belum ada investor.</p>
            ) : (
              <div className="space-y-3">
                {pool.investments.slice(0, 10).map((inv, i) => (
                  <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inv.investor.name || (
                            inv.investor.walletAddress
                              ? `${inv.investor.walletAddress.slice(0, 8)}…`
                              : "Investor"
                          )}
                        </p>
                        {inv.investor.walletAddress && (
                          <a
                            href={getStellarExpertUrl(inv.investor.walletAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-blue-500 hover:underline"
                          >
                            {inv.investor.walletAddress.slice(0, 10)}…
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{inv.tokensOwned} token</p>
                      <p className="text-xs text-gray-500">
                        Rp {(inv.tokensOwned * pool.pricePerToken / 1e6).toFixed(2)}Jt
                      </p>
                    </div>
                  </div>
                ))}
                {pool.investments.length > 10 && (
                  <p className="text-xs text-gray-400 text-center pt-2">
                    +{pool.investments.length - 10} investor lainnya
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="md:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-6">Timeline Proses</h2>
            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-100" />
              <div className="space-y-6 relative z-10">
                {TIMELINE_STAGES.map((stage, i) => {
                  const isDone = i < currentStageIdx;
                  const isActive = i === currentStageIdx;
                  return (
                    <div key={stage.key} className="flex items-start gap-4">
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 bg-white" />
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                      ) : (
                        <CircleDashed className="w-6 h-6 text-gray-300 flex-shrink-0 bg-white" />
                      )}
                      <div>
                        <p className={cn(
                          "text-sm font-semibold leading-snug",
                          isDone ? "text-gray-900" : isActive ? "text-blue-700" : "text-gray-400"
                        )}>
                          {stage.label}
                        </p>
                        {isActive && (
                          <p className="text-xs text-blue-500 mt-0.5">Sedang berlangsung…</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pool ID on-chain */}
            {pool.smartContractAddr && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Contract Stellar</p>
                <a
                  href={getStellarExpertUrl(pool.smartContractAddr, "account")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
                >
                  {pool.smartContractAddr.slice(0, 12)}…
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonitoringDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-gray-400 gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>}>
      <DetailContent />
    </Suspense>
  );
}
