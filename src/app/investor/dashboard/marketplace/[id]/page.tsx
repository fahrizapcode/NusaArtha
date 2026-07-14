"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, MapPin, Building2, Users, Clock, TrendingUp,
  ShieldCheck, Star, Download, ChevronDown, Info, Banknote,
  FileText, Loader2, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useStellarWallet } from "@/lib/stellar/context";
import { getTokenBalance } from "@/lib/stellar/assets";
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
  brand: {
    id: string;
    name: string;
    businessType: string;
    riskLevel: string;
    readinessScore: number | null;
    owner: { name: string | null; email: string };
  };
  investments: { id: string; tokensOwned: number; investor: { walletAddress: string | null } }[];
  outlets: { id: string; name: string; status: string; operator: { name: string | null } | null }[];
};

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;

  const { isConnected, publicKey } = useStellarWallet();
  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [collected, setCollected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDD, setOpenDD] = useState<number | null>(0);
  const [myTokenBalance, setMyTokenBalance] = useState(0);

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

  useEffect(() => {
    if (!publicKey || !pool) return;
    getTokenBalance(publicKey, pool.id).then(setMyTokenBalance);
  }, [publicKey, pool]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data kampanye…
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">Kampanye tidak ditemukan.</p>
        <Button onClick={() => router.back()} variant="outline">Kembali</Button>
      </div>
    );
  }

  const shares = (() => {
    try { return JSON.parse(pool.revenueShares); }
    catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; }
  })();

  const tokensSold = pool.investments.reduce((s, i) => s + i.tokensOwned, 0);
  const tokensAvailable = pool.totalSupply - tokensSold;
  const uniqueInvestors = new Set(pool.investments.map((i) => i.investor.walletAddress)).size;
  const isActive = ["PUBLISHED", "ACTIVE"].includes(pool.status);

  const RISK_COLORS: Record<string, string> = {
    LOW: "text-green-700 bg-green-50",
    EMERGING: "text-yellow-700 bg-yellow-50",
    MEZZANINE: "text-blue-700 bg-blue-50",
    MATURE: "text-green-700 bg-green-50",
    HIGH_RISK: "text-red-700 bg-red-50",
    PENDING: "text-gray-600 bg-gray-100",
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-32">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group mb-6"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Marketplace
      </button>

      {/* Hero */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-40 md:h-56 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-800 shadow-lg">
                {pool.brand.name.charAt(0)}
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  )}>
                    {isActive ? "Campaign Aktif" : pool.status}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Brand
                  </span>
                  {pool.smartContractAddr && (
                    <a
                      href={getStellarExpertUrl(pool.smartContractAddr, "account")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 hover:bg-white/30"
                    >
                      <ExternalLink className="w-3 h-3" /> Stellar
                    </a>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-bold">{pool.name}</h1>
                <p className="text-white/80 font-medium text-sm">{pool.brand.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-between bg-white">
          <div className="flex-1 w-full">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Dana Terkumpul</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    Rp {(collected / 1e6).toFixed(1)}Jt
                  </span>
                  <span className="text-sm text-gray-500">
                    dari Rp {(pool.targetFunding / 1e6).toFixed(0)}Jt
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-green-500" : "bg-blue-600")}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <strong className="text-gray-700">{uniqueInvestors}</strong> investor
              </span>
              <span className="flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" />
                <strong className="text-gray-700">{tokensAvailable}</strong> token tersisa
              </span>
              {myTokenBalance > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anda punya <strong>{myTokenBalance}</strong> token
                </span>
              )}
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0">
            {isActive ? (
              <Link href={`/investor/dashboard/marketplace/${pool.id}/invest`} className="w-full block">
                <Button size="lg" className="w-full md:w-48 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                  Investasi sekarang
                </Button>
              </Link>
            ) : (
              <Button size="lg" disabled className="w-full md:w-48">
                Campaign {pool.status === "OPERATING" ? "Sudah Berjalan" : "Tutup"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">

          {/* Tentang Outlet */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Tentang outlet</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: "Lokasi", val: pool.location },
                { icon: Building2, label: "Kategori", val: pool.brand.businessType },
                { icon: Clock, label: "Status", val: pool.status },
                { icon: Info, label: "Outlet", val: pool.outlets.length > 0 ? `${pool.outlets.length} outlet` : "Belum ada" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <item.icon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">{item.label}</p>
                    <p className="text-sm text-gray-900 font-medium">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Brand profile */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Profil brand</h2>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 text-xl shrink-0">
                {pool.brand.name.charAt(0)}{pool.brand.name.charAt(1)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{pool.brand.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{pool.brand.businessType}</p>
                <div className="flex flex-wrap gap-2">
                  {pool.brand.readinessScore && (
                    <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Score: {pool.brand.readinessScore}/100
                    </span>
                  )}
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-md", RISK_COLORS[pool.brand.riskLevel] || "bg-gray-100 text-gray-600")}>
                    {pool.brand.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue sharing */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Simulasi bagi hasil</h2>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Investor", pct: shares.investor, color: "bg-blue-500" },
                  { label: "Brand", pct: shares.brand, color: "bg-indigo-500" },
                  { label: "Operator", pct: shares.operator, color: "bg-orange-500" },
                  { label: "Platform", pct: shares.platform, color: "bg-gray-400" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{s.pct}%</p>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 rounded-xl p-3 border border-blue-100">
              Distribusi dihitung dari <strong>distributable cash</strong> (pendapatan bersih setelah semua biaya operasional)
              dan dieksekusi via transaksi Stellar yang dapat diverifikasi on-chain.
            </p>
          </section>

          {/* Due diligence */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Due diligence platform</h2>
            <div className="space-y-3">
              {[
                { title: "Verifikasi Legalitas", status: "Verified", text: "Legalitas brand diverifikasi tim platform. Dokumen disimpan di IPFS." },
                { title: "Analisis Pasar & Lokasi", status: "Verified", text: `Outlet di ${pool.location} telah dianalisis tim lapangan.` },
                { title: "Scoring Kesiapan Brand", status: pool.brand.readinessScore ? "Verified" : "Pending", text: `Brand Readiness Score: ${pool.brand.readinessScore || "Belum tersedia"}/100` },
                { title: "Profil Risiko", status: pool.brand.riskLevel, text: `Level risiko: ${pool.brand.riskLevel}. Keputusan investasi tetap tanggung jawab investor.` },
              ].map((dd, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenDD(openDD === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={cn("w-4 h-4", dd.status === "Verified" ? "text-green-500" : "text-orange-500")} />
                      <span className="font-semibold text-sm text-gray-900">{dd.title}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", openDD === i && "rotate-180")} />
                  </button>
                  {openDD === i && (
                    <div className="p-4 text-sm text-gray-600 border-t border-gray-100 bg-white leading-relaxed">
                      {dd.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 relative">
          {/* Invest card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Informasi Pendanaan</h3>
            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Investor</span>
                <span className="font-semibold">{uniqueInvestors} orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Harga token</span>
                <span className="font-bold text-blue-600">
                  Rp {pool.pricePerToken.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total supply</span>
                <span className="font-semibold">{pool.totalSupply.toLocaleString()} token</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token tersedia</span>
                <span className="font-semibold">{tokensAvailable.toLocaleString()}</span>
              </div>
              {myTokenBalance > 0 && (
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-green-700 font-medium">Token saya</span>
                  <span className="font-bold text-green-700">{myTokenBalance}</span>
                </div>
              )}
            </div>

            {!isConnected && <WalletButton variant="outline" className="w-full mb-3 justify-center" />}

            {isActive ? (
              <Link href={`/investor/dashboard/marketplace/${pool.id}/invest`} className="block w-full">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                  Investasi sekarang
                </Button>
              </Link>
            ) : (
              <Button size="lg" disabled className="w-full">
                Campaign {pool.status}
              </Button>
            )}

            {pool.smartContractAddr && (
              <a
                href={getStellarExpertUrl(pool.smartContractAddr, "account")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-3 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Lihat kontrak di Stellar
              </a>
            )}
          </div>

          {/* Operator */}
          {pool.outlets.length > 0 && pool.outlets[0].operator && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Operator outlet</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                  {pool.outlets[0].operator.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {pool.outlets[0].operator.name || "Operator ditugaskan"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-semibold text-gray-700">Terverifikasi NusaArtha</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dokumen */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Dokumen pendukung</h3>
            <div className="space-y-3">
              {pool.disclosureCID ? (
                <a
                  href={getIPFSGatewayUrl(pool.disclosureCID)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                >
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Disclosure Document</p>
                    <p className="text-[10px] text-gray-500">IPFS · {pool.disclosureCID.slice(0, 12)}…</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </a>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">
                  Dokumen belum tersedia
                </p>
              )}
              {pool.brand.riskLevel && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
                  <strong>Disclaimer:</strong> Token merepresentasikan hak ekonomi, bukan kepemilikan aset fisik. Investasi mengandung risiko.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
