"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, Store, Wallet, TrendingUp,
  PieChart, ShieldCheck, Loader2, ExternalLink, AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import { getIPFSGatewayUrl } from "@/lib/ipfs";

type PoolDetail = {
  id: string;
  name: string;
  location: string;
  targetFunding: number;
  totalSupply: number;
  pricePerToken: number;
  status: string;
  smartContractAddr?: string;
  disclosureCID?: string;
  revenueShares: string;
  brand: { name: string; riskLevel: string; readinessScore: number | null };
  investments: { tokensOwned: number }[];
  outlets: { id: string; name: string; operator: { name: string | null } | null }[];
};

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;

  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [collected, setCollected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!poolId) return;
    fetch(`/api/pools/${poolId}`)
      .then((r) => r.json())
      .then((d) => {
        setPool(d.pool);
        setCollected(d.collected || 0);
        setProgress(d.progress || 0);
      })
      .finally(() => setLoading(false));
  }, [poolId]);

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch(`/api/pools/${poolId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mempublikasikan");
      setPool((p) => p ? { ...p, status: "PUBLISHED", disclosureCID: data.disclosureCID } : p);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleReject = async () => {
    setPublishing(true);
    try {
      await fetch(`/api/pools/${poolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT" }),
      });
      setPool((p) => p ? { ...p, status: "DRAFT" } : p);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat kampanye…
      </div>
    );
  }
  if (!pool) {
    return <div className="text-center py-24 text-gray-500">Kampanye tidak ditemukan.</div>;
  }

  const shares = (() => {
    try { return JSON.parse(pool.revenueShares); }
    catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; }
  })();

  const isPublished = ["PUBLISHED", "ACTIVE", "OPERATING"].includes(pool.status);
  const isDraft = pool.status === "DRAFT";
  const uniqueInvestors = pool.investments.length;

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke campaign outlet
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">
            {pool.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pool.name}</h1>
            <p className="text-sm text-gray-500">{pool.brand.name} · {pool.location}</p>
            {pool.smartContractAddr && (
              <a
                href={getStellarExpertUrl(pool.smartContractAddr, "account")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> Stellar Contract
              </a>
            )}
          </div>
        </div>
        <span className={cn(
          "text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide",
          isDraft ? "bg-orange-50 text-orange-700" :
          isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
        )}>
          {isDraft ? "Menunggu review" : isPublished ? "Dipublikasikan" : pool.status}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Outlet info */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-400" /> Informasi outlet
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Nama</p><p className="font-medium text-gray-900">{pool.name}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Lokasi</p><p className="font-medium text-gray-900">{pool.location}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Brand</p><p className="font-medium text-gray-900">{pool.brand.name}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Risk Level</p><p className="font-medium text-gray-900">{pool.brand.riskLevel}</p></div>
              {pool.outlets[0]?.operator && (
                <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Operator</p><p className="font-medium text-gray-900">{pool.outlets[0].operator.name}</p></div>
              )}
            </div>
          </section>

          {/* Funding */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-400" /> Pendanaan
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Target dana</p><p className="font-bold text-gray-900">Rp {pool.targetFunding.toLocaleString("id-ID")}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Harga token</p><p className="font-medium text-gray-900">Rp {pool.pricePerToken.toLocaleString("id-ID")}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Supply token</p><p className="font-medium text-gray-900">{pool.totalSupply.toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Investor</p><p className="font-medium text-gray-900">{uniqueInvestors}</p></div>
            </div>
            {/* Progress */}
            <div>
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="text-gray-500">Terkumpul: <strong>Rp {collected.toLocaleString("id-ID")}</strong></span>
                <span className="font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </section>

          {/* IPFS disclosure */}
          {pool.disclosureCID && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" /> Disclosure document
              </h2>
              <a
                href={getIPFSGatewayUrl(pool.disclosureCID)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                IPFS: {pool.disclosureCID.slice(0, 20)}…
              </a>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-gray-400" /> Revenue sharing
            </h3>
            <div className="space-y-3 mb-6">
              {[
                { label: "Investor", pct: shares.investor, color: "bg-blue-500" },
                { label: "Brand", pct: shares.brand, color: "bg-green-500" },
                { label: "Operator", pct: shares.operator, color: "bg-orange-500" },
                { label: "Platform", pct: shares.platform, color: "bg-gray-400" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{s.label}</span>
                    <span className="font-bold text-gray-900">{s.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Admin note */}
            {isDraft && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Catatan reviewer</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan untuk disclosure…"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            )}

            {error && (
              <div className="mb-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-2.5 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {isDraft && (
              <div className="space-y-2">
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Publikasikan campaign
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={publishing}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Tolak campaign
                </Button>
              </div>
            )}

            {isPublished && (
              <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium text-center border border-green-200 space-y-2">
                <p>✓ Campaign aktif di marketplace</p>
                {pool.disclosureCID && (
                  <p className="text-xs font-mono text-green-600">
                    CID: {pool.disclosureCID.slice(0, 14)}…
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
