"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, CircleDashed, TrendingUp,
  Banknote, Download, ExternalLink, Loader2, Wallet, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useStellarWallet } from "@/lib/stellar/context";
import { getTokenBalance } from "@/lib/stellar/assets";
import { getPaymentHistory } from "@/lib/stellar/transactions";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type InvestmentDetail = {
  id: string;
  tokensOwned: number;
  createdAt: string;
  pool: {
    id: string;
    name: string;
    location: string;
    status: string;
    pricePerToken: number;
    totalSupply: number;
    smartContractAddr?: string;
    revenueShares: string;
    brand: { name: string; businessType: string };
    outlets: { id: string; name: string; status: string }[];
  };
};

type RevenueItem = {
  date: string;
  period: string;
  amount: string;
  amountNum: number;
  status: "Selesai" | "Pending";
  txHash: string;
};

const TIMELINE_STAGES = [
  { key: "DRAFT", label: "Campaign Selesai" },
  { key: "ACTIVE", label: "Pencairan Dana ke Brand" },
  { key: "OPERATING", label: "Outlet Beroperasi" },
  { key: "COMPLETED", label: "Distribusi Revenue" },
];
const STATUS_ORDER = ["DRAFT", "PUBLISHED", "ACTIVE", "OPERATING", "COMPLETED"];

export default function PortfolioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const investmentId = params.id as string;
  const { publicKey } = useStellarWallet();

  const [inv, setInv] = useState<InvestmentDetail | null>(null);
  const [onChainBalance, setOnChainBalance] = useState(0);
  const [revenueHistory, setRevenueHistory] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalReceived, setTotalReceived] = useState(0);

  const load = async () => {
    // Fetch investment detail
    const res = await fetch(`/api/investments?investorId=${publicKey || ""}`);
    const data = await res.json();
    const found = (data.investments || []).find((i: any) => i.id === investmentId);
    if (found) {
      setInv(found);

      // On-chain balance
      if (publicKey) {
        const bal = await getTokenBalance(publicKey, found.pool.id);
        setOnChainBalance(bal);

        // Revenue history from Stellar
        const payments = await getPaymentHistory(publicKey, 50);
        const incoming = payments
          .filter((p: any) => p.type === "payment" && p.to === publicKey && p.asset_type === "native")
          .map((p: any) => {
            const amt = parseFloat(p.amount);
            return {
              date: new Date(p.created_at).toLocaleDateString("id-ID"),
              period: new Date(p.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
              amount: `XLM ${amt.toFixed(2)}`,
              amountNum: amt,
              status: "Selesai" as const,
              txHash: p.transaction_hash,
            };
          });
        setRevenueHistory(incoming);
        setTotalReceived(incoming.reduce((s: number, r: RevenueItem) => s + r.amountNum, 0));
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [investmentId, publicKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDownload = () => {
    if (!inv || revenueHistory.length === 0) return;
    const csv = [
      "Tanggal,Periode,Jumlah,Status,TX Hash",
      ...revenueHistory.map((r) => `"${r.date}","${r.period}","${r.amount}","${r.status}","${r.txHash}"`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `revenue-${inv.pool.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat detail investasi…
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">Investasi tidak ditemukan.</p>
        <Button onClick={() => router.back()} variant="outline">Kembali</Button>
      </div>
    );
  }

  const shares = (() => {
    try { return JSON.parse(inv.pool.revenueShares); }
    catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; }
  })();

  const ownership = ((inv.tokensOwned / inv.pool.totalSupply) * 100).toFixed(2);
  const valueIDR = inv.tokensOwned * inv.pool.pricePerToken;
  const currentStageIdx = STATUS_ORDER.indexOf(inv.pool.status);

  const STATUS_LABEL: Record<string, string> = {
    DRAFT: "Menunggu Review",
    PUBLISHED: "Campaign Aktif",
    ACTIVE: "Campaign Aktif",
    OPERATING: "Beroperasi",
    COMPLETED: "Selesai",
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Portfolio
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-700 text-lg shrink-0">
              {inv.pool.brand.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{inv.pool.name}</h1>
              <p className="text-sm text-gray-500">{inv.pool.brand.name} · {inv.pool.location}</p>
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase",
              inv.pool.status === "OPERATING" ? "bg-green-50 text-green-700" :
              ["PUBLISHED", "ACTIVE"].includes(inv.pool.status) ? "bg-blue-50 text-blue-700" :
              "bg-gray-100 text-gray-600"
            )}>
              {STATUS_LABEL[inv.pool.status] || inv.pool.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-1.5 border-gray-200">
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          </Button>
          <Link href={`/investor/dashboard/marketplace/${inv.pool.id}`}>
            <Button variant="outline" size="sm" className="border-gray-200 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Halaman Publik
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Nilai Investasi", val: `Rp ${(valueIDR / 1e6).toFixed(2)}Jt`, sub: `${inv.tokensOwned} token` },
          { label: "Kepemilikan", val: `${ownership}%`, sub: "dari total pool" },
          { label: "Token On-chain", val: onChainBalance > 0 ? onChainBalance.toString() : "—", sub: "Stellar balance", color: onChainBalance > 0 ? "text-green-600" : "text-gray-400" },
          { label: "Revenue Diterima", val: `${totalReceived.toFixed(2)} XLM`, sub: "total sepanjang waktu", color: "text-blue-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={cn("text-xl font-bold", s.color || "text-gray-900")}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Wallet / On-chain info */}
      {publicKey && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-blue-200" />
            <div>
              <p className="text-blue-200 text-xs font-medium">Stellar Wallet</p>
              <p className="font-mono text-sm">{publicKey.slice(0, 10)}…{publicKey.slice(-8)}</p>
            </div>
          </div>
          <a
            href={getStellarExpertUrl(publicKey, "account")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-200 hover:text-white flex items-center gap-1 underline underline-offset-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Lihat di Stellar Explorer
          </a>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Revenue Sharing Info */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Skema Revenue Sharing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Investor", pct: shares.investor, color: "bg-blue-500" },
                { label: "Brand", pct: shares.brand, color: "bg-green-500" },
                { label: "Operator", pct: shares.operator, color: "bg-orange-500" },
                { label: "Platform", pct: shares.platform, color: "bg-gray-400" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.pct}%</p>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 rounded-xl p-3 border border-blue-100">
              Bagian Anda = <strong>{ownership}%</strong> kepemilikan × {shares.investor}% investor share × distributable cash.
              Distribusi dikirim langsung ke wallet Stellar Anda.
            </p>
          </section>

          {/* Distribution History */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Riwayat Distribusi Revenue</h2>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={revenueHistory.length === 0} className="h-8 text-xs gap-2 border-gray-200">
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>
            {revenueHistory.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                Belum ada distribusi revenue diterima.
                <br />
                <span className="text-xs">Revenue dikirim via Stellar setelah outlet beroperasi.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/60 border-b border-gray-100">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Periode</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">TX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {revenueHistory.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-700">{r.date}</td>
                        <td className="px-5 py-3 text-gray-600">{r.period}</td>
                        <td className="px-5 py-3 font-semibold text-green-600">{r.amount}</td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={getStellarExpertUrl(r.txHash, "tx")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline font-mono flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {r.txHash.slice(0, 10)}…
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Timeline + CCTV */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-6">Timeline Proyek</h2>
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
                      <p className={cn("text-sm font-semibold pt-0.5", isDone ? "text-gray-900" : isActive ? "text-blue-700" : "text-gray-400")}>
                        {stage.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart contract link */}
            {inv.pool.smartContractAddr && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Stellar Contract</p>
                <a
                  href={getStellarExpertUrl(inv.pool.smartContractAddr, "account")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {inv.pool.smartContractAddr.slice(0, 14)}…
                </a>
              </div>
            )}
          </section>

          {/* CCTV placeholder */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-4 text-center">
              <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-sm">Segera Hadir</span>
              <p className="text-sm font-medium text-white drop-shadow-md">Live CCTV Outlet untuk Investor</p>
            </div>
            <h2 className="font-bold text-gray-900 mb-4 opacity-50">Live CCTV</h2>
            <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
          </section>
        </div>
      </div>
    </div>
  );
}
