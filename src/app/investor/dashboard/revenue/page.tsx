"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import {
  LineChart,
  Wallet,
  ArrowDownToLine,
  History,
  ExternalLink,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useStellarWallet } from "@/lib/stellar/context";
import { getPaymentHistory } from "@/lib/stellar/transactions";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type PaymentRecord = {
  id: string;
  type: string;
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: string;
  from: string;
  to: string;
  created_at: string;
  transaction_hash: string;
};

type Distribution = {
  outlet: string;
  period: string;
  amount: string;
  amountNum: number;
  status: "Selesai" | "Pending";
  txHash: string;
  explorerUrl: string;
};

export default function RevenuePage() {
  const { isConnected, publicKey, xlmBalance } = useStellarWallet();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, pending: 0 });

  const PLATFORM_KEY = process.env.NEXT_PUBLIC_PLATFORM_ISSUER_KEY || "";

  const loadHistory = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const payments: PaymentRecord[] = await getPaymentHistory(publicKey, 50);

      // Tampilkan incoming payments yang relevan untuk wallet investor, baik XLM maupun asset token.
      const incoming = payments.filter((p) => {
        if (p.type !== "payment" || p.to !== publicKey) return false;
        if (p.asset_type === "native") return true;
        if (!p.asset_code || !p.asset_issuer) return false;
        if (PLATFORM_KEY) {
          return p.asset_issuer === PLATFORM_KEY || p.from === PLATFORM_KEY;
        }
        return true;
      });

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalVal = 0;
      let monthVal = 0;
      let pendingVal = 0;

      const dist: Distribution[] = incoming.map((p) => {
        const amountNum = parseFloat(p.amount);
        const date = new Date(p.created_at);
        const isThisMonth = date >= firstOfMonth;
        totalVal += amountNum;
        if (isThisMonth) monthVal += amountNum;

        const isNative = p.asset_type === "native";
        const assetLabel = isNative ? "XLM" : p.asset_code || "Asset";
        const period = date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });

        return {
          outlet: isNative ? "Revenue Sharing" : "Token Pool",
          period,
          amount: `${assetLabel} ${amountNum.toFixed(2)}`,
          amountNum,
          status: "Selesai" as const,
          txHash: p.transaction_hash,
          explorerUrl: getStellarExpertUrl(p.transaction_hash, "tx"),
        };
      });

      setDistributions(dist);
      setStats({ total: totalVal, thisMonth: monthVal, pending: pendingVal });
    } finally {
      setLoading(false);
    }
  }, [publicKey, PLATFORM_KEY]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDownload = () => {
    if (distributions.length === 0) return;
    const csv = [
      "Outlet,Periode,Jumlah,Status,TX Hash",
      ...distributions.map(
        (d) =>
          `"${d.outlet}","${d.period}","${d.amount}","${d.status}","${d.txHash}"`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `revenue-sharing-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Revenue sharing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Riwayat distribusi bagi hasil via jaringan Stellar.
          </p>
        </div>
        <div className="flex gap-2">
          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5 border-gray-200 text-gray-600"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
          )}
          {!isConnected && <WalletButton variant="outline" size="sm" />}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Total Diterima
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isConnected ? `${stats.total.toFixed(2)} XLM` : "—"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Bulan Ini
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isConnected ? `${stats.thisMonth.toFixed(2)} XLM` : "—"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Saldo XLM
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isConnected ? `${xlmBalance.toFixed(2)} XLM` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            Riwayat Distribusi On-Chain
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={distributions.length === 0}
              className="h-8 text-xs gap-2"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> CSV
            </Button>
            {publicKey && (
              <a
                href={getStellarExpertUrl(publicKey, "account")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline px-2 py-1 border border-blue-100 rounded-lg bg-blue-50"
              >
                <ExternalLink className="w-3 h-3" /> Explorer
              </a>
            )}
          </div>
        </div>

        {!isConnected ? (
          <div className="py-16 flex flex-col items-center gap-4 text-center px-4">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
              <History className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              Hubungkan wallet untuk melihat riwayat distribusi.
            </p>
            <WalletButton />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat riwayat dari
            Stellar…
          </div>
        ) : distributions.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <History className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-500">
              Belum ada distribusi ditemukan untuk wallet ini.
            </p>
            <p className="text-xs text-gray-400">
              Distribusi revenue dikirim langsung ke wallet Stellar Anda oleh
              platform.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Outlet
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Periode
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Tx
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {distributions.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {row.outlet}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{row.period}</td>
                    <td className="px-5 py-4 font-bold text-green-600">
                      {row.amount}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase",
                          row.status === "Selesai"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={row.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {row.txHash.slice(0, 8)}…
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
