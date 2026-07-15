"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, MapPin, Users, TrendingUp, PieChart, ShieldCheck,
  Wallet, Loader2, CheckCircle2, AlertCircle, ExternalLink,
  Plus, Minus, BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStellarWallet } from "@/lib/stellar/context";
import { WalletButton } from "@/components/ui/wallet-button";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import { getIPFSGatewayUrl } from "@/lib/ipfs";

type PoolDetail = {
  id: string; name: string; location: string;
  targetFunding: number; totalSupply: number; pricePerToken: number;
  status: string; smartContractAddr?: string; disclosureCID?: string;
  revenueShares: string; endDate?: string | null;
  roiEstimate?: string | null; bepEstimate?: string | null;
  brand: { name: string; businessType: string; riskLevel: string; readinessScore: number | null };
  investments: { tokensOwned: number; investorId: string }[];
  outlets: { id: string; name: string; operator: { name: string | null } | null }[];
};

const RISK_COLOR: Record<string, string> = {
  MATURE: "text-green-700 bg-green-50 border-green-200",
  MEZZANINE: "text-blue-700 bg-blue-50 border-blue-200",
  EMERGING: "text-yellow-700 bg-yellow-50 border-yellow-200",
  HIGH_RISK: "text-red-700 bg-red-50 border-red-200",
  PENDING: "text-gray-600 bg-gray-100 border-gray-200",
};

export default function MarketplaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;

  const { isConnected, publicKey } = useStellarWallet();
  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [collected, setCollected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Buy form
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState<{ success: boolean; msg: string; txHash?: string } | null>(null);
  const [user, setUser] = useState<{ id: string; isKYCVerified: boolean } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/pools/${poolId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([poolData, meData]) => {
      setPool(poolData.pool);
      setCollected(poolData.collected || 0);
      setProgress(poolData.progress || 0);
      if (meData.user) setUser({ id: meData.user.id, isKYCVerified: meData.user.isKYCVerified });
    }).finally(() => setLoading(false));
  }, [poolId]);

  const tokensSold = pool?.investments.reduce((s, i) => s + i.tokensOwned, 0) || 0;
  const tokensLeft = (pool?.totalSupply || 0) - tokensSold;

  const handleBuy = async () => {
    if (!pool || !user) return;
    if (!user.isKYCVerified) { router.push("/investor/verify"); return; }

    setBuying(true);
    setBuyResult(null);

    try {
      // 1. Record investment in DB
      const invRes = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorId: user.id,
          poolId: pool.id,
          tokensOwned: qty,
          walletAddress: publicKey || undefined,
        }),
      });
      const invData = await invRes.json();
      if (!invRes.ok) throw new Error(invData.error);

      // 2. If wallet connected, mint tokens on-chain
      if (publicKey) {
        const mintRes = await fetch("/api/investments/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            poolId: pool.id,
            investorPublicKey: publicKey,
            tokenAmount: qty,
          }),
        });
        const mintData = await mintRes.json();
        if (mintData.success) {
          setBuyResult({ success: true, msg: `Berhasil! ${qty} token dikirim ke wallet Anda.`, txHash: mintData.txHash });
        } else {
          // DB recorded, on-chain failed — partial success
          setBuyResult({ success: true, msg: `Investasi tercatat di database. On-chain minting: ${mintData.error || "belum tersedia (testnet)."}` });
        }
      } else {
        setBuyResult({ success: true, msg: `${qty} token berhasil dicatat. Hubungkan Freighter wallet untuk menerima token on-chain.` });
      }

      // Refresh pool data
      const updated = await fetch(`/api/pools/${poolId}`).then((r) => r.json());
      setPool(updated.pool);
      setCollected(updated.collected);
      setProgress(updated.progress);
    } catch (err: any) {
      setBuyResult({ success: false, msg: err.message });
    } finally {
      setBuying(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Memuat campaign…
    </div>
  );

  if (!pool) return <div className="text-center py-24 text-gray-500">Campaign tidak ditemukan.</div>;

  const shares = (() => { try { return JSON.parse(pool.revenueShares); } catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; } })();
  const totalInvestment = qty * pool.pricePerToken;
  const myOwnershipPct = ((qty / pool.totalSupply) * 100).toFixed(2);
  const isOpen = ["PUBLISHED", "ACTIVE"].includes(pool.status);
  const uniqueInvestors = new Set(pool.investments.map((i) => i.investorId)).size;

  return (
    <div className="max-w-[960px] mx-auto space-y-6 pb-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali ke marketplace
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 flex-shrink-0">
              {pool.brand.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-gray-900">{pool.name}</h1>
                <BadgeCheck className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500">{pool.brand.name} · {pool.brand.businessType}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <MapPin className="w-3 h-3" /> {pool.location}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full border", RISK_COLOR[pool.brand.riskLevel] || "bg-gray-100 text-gray-600 border-gray-200")}>
              {pool.brand.riskLevel}
            </span>
            {pool.brand.readinessScore && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                Score {pool.brand.readinessScore}/100
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Rp {(collected / 1e6).toFixed(1)}Jt terkumpul dari Rp {(pool.targetFunding / 1e6).toFixed(0)}Jt</span>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.max(2, progress)}%` }} />
          </div>
        </div>
        <div className="flex gap-5 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> <strong className="text-gray-900">{uniqueInvestors}</strong> investor</span>
          <span><strong className="text-gray-900">{tokensLeft}</strong> token tersisa</span>
          {pool.endDate && (
            <span>
              Berakhir: <strong className="text-gray-900">
                {new Date(pool.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </strong>
            </span>
          )}
          {pool.smartContractAddr && (
            <a href={getStellarExpertUrl(pool.smartContractAddr, "account")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
              <ExternalLink className="w-3 h-3" /> Stellar contract
            </a>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="md:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Harga Token", val: `Rp ${(pool.pricePerToken / 1000).toFixed(0)}K` },
              { label: "Est. ROI/Tahun", val: pool.roiEstimate || "—" },
              { label: "Est. BEP", val: pool.bepEstimate || "—" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Revenue shares */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-400" /> Skema Revenue Sharing</h2>
            <div className="space-y-3">
              {[
                { label: "Investor", pct: shares.investor, color: "bg-blue-500" },
                { label: "Brand", pct: shares.brand, color: "bg-green-500" },
                { label: "Operator", pct: shares.operator, color: "bg-orange-400" },
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
          </div>

          {/* Disclosure doc */}
          {pool.disclosureCID && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /> Disclosure Document</h2>
              <a href={getIPFSGatewayUrl(pool.disclosureCID)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <ExternalLink className="w-4 h-4" /> IPFS: {pool.disclosureCID.slice(0, 24)}…
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
            <strong>Disclaimer:</strong> Investasi ini bersifat private dan mengandung risiko. Proyeksi ROI dan BEP merupakan estimasi operasional, bukan jaminan keuntungan. Keputusan investasi sepenuhnya tanggung jawab investor.
          </div>
        </div>

        {/* Right: Buy widget */}
        <div className="sticky top-24 self-start">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Wallet className="w-4 h-4 text-gray-400" /> Beli Token</h3>

            {!isOpen ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                Campaign ini sudah tidak menerima investasi baru.
              </div>
            ) : (
              <>
                {/* Token qty */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Jumlah Token</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <input type="number" min={1} max={tokensLeft} value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(tokensLeft, parseInt(e.target.value) || 1)))}
                      className="flex-1 text-center font-bold text-lg border border-gray-200 rounded-xl py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    <button onClick={() => setQty(Math.min(tokensLeft, qty + 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">{tokensLeft} token tersisa</p>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 rounded-xl p-3 space-y-2 border border-blue-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Harga/token</span>
                    <span className="font-semibold">Rp {pool.pricePerToken.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kepemilikan</span>
                    <span className="font-semibold">{myOwnershipPct}%</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-blue-200 pt-2 mt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-700">Rp {totalInvestment.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* KYC gate */}
                {user && !user.isKYCVerified && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    KYC diperlukan sebelum berinvestasi.{" "}
                    <Link href="/investor/verify" className="underline font-semibold">Verifikasi sekarang</Link>
                  </div>
                )}

                {/* Wallet gate */}
                {!isConnected && (
                  <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    Hubungkan wallet Freighter untuk menerima token on-chain.
                  </div>
                )}

                {buyResult && (
                  <div className={cn("flex items-start gap-2 text-xs rounded-xl p-3 border",
                    buyResult.success ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200")}>
                    {buyResult.success ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                    <span>{buyResult.msg}
                      {buyResult.txHash && (
                        <> · <a href={getStellarExpertUrl(buyResult.txHash, "tx")} target="_blank" rel="noopener noreferrer" className="underline">Lihat TX</a></>
                      )}
                    </span>
                  </div>
                )}

                <Button onClick={handleBuy} disabled={buying || tokensLeft === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold gap-2">
                  {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  {buying ? "Memproses…" : tokensLeft === 0 ? "Token Habis" : "Beli Token"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
