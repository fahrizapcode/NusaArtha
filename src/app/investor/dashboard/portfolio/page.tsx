"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  TrendingUp,
  Store,
  ChevronRight,
  PieChart,
  Wallet,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useStellarWallet } from "@/lib/stellar/context";
import { getTokenBalance, getAllPoolBalances } from "@/lib/stellar/assets";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type Investment = {
  id: string;
  tokensOwned: number;
  createdAt: string;
  pool: {
    id: string;
    name: string;
    location: string;
    pricePerToken: number;
    totalSupply: number;
    status: string;
    brand: { name: string; businessType: string };
    investments: { tokensOwned: number }[];
  };
};

type EnrichedInvestment = Investment & {
  onChainBalance: number;
  progress: number;
  collected: number;
  ownership: string;
};

export default function PortfolioPage() {
  const { isConnected, publicKey, xlmBalance, poolBalances, refreshBalances } =
    useStellarWallet();
  const [investments, setInvestments] = useState<EnrichedInvestment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    activeCampaigns: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Support both: wallet address OR JWT session
      let url = "";
      if (publicKey) {
        url = `/api/investments?walletAddress=${publicKey}`;
      } else {
        // Try JWT session
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const me = await meRes.json();
          url = `/api/investments?investorId=${me.user.id}`;
        }
      }
      if (!url) {
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      const data = await res.json();
      const invs: Investment[] = data.investments || [];

      // Enrich with on-chain balances
      const enriched: EnrichedInvestment[] = await Promise.all(
        invs.map(async (inv) => {
          const onChainBalance = publicKey
            ? await getTokenBalance(publicKey, inv.pool.id)
            : 0;
          const collected = (inv.pool.investments ?? []).reduce(
            (s, i) => s + i.tokensOwned * inv.pool.pricePerToken,
            0,
          );
          const progress = Math.min(
            100,
            Math.round(
              (collected / (inv.pool.totalSupply * inv.pool.pricePerToken)) *
                100,
            ),
          );
          const ownership = (
            (inv.tokensOwned / inv.pool.totalSupply) *
            100
          ).toFixed(2);
          return { ...inv, onChainBalance, collected, progress, ownership };
        }),
      );

      setInvestments(enriched);
      const totalValue = enriched.reduce(
        (s, i) => s + i.tokensOwned * i.pool.pricePerToken,
        0,
      );
      const activeCampaigns = enriched.filter((i) =>
        ["PUBLISHED", "ACTIVE"].includes(i.pool.status),
      ).length;
      setStats({ total: enriched.length, totalValue, activeCampaigns });
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Also reload when wallet connects
  useEffect(() => {
    if (publicKey) load();
  }, [publicKey, load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refreshBalances()]);
    setRefreshing(false);
  };

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    PUBLISHED: { label: "Campaign Aktif", cls: "bg-blue-50 text-blue-700" },
    ACTIVE: { label: "Campaign Aktif", cls: "bg-blue-50 text-blue-700" },
    OPERATING: { label: "Beroperasi", cls: "bg-green-50 text-green-700" },
    COMPLETED: { label: "Selesai", cls: "bg-gray-100 text-gray-600" },
    DRAFT: { label: "Draft", cls: "bg-gray-100 text-gray-500" },
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Portfolio investasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau perkembangan aset dan token Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Wallet balance banner */}
      {isConnected && publicKey && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">
                Stellar Wallet
              </p>
              <p className="font-mono text-sm opacity-80">
                {publicKey.slice(0, 8)}…{publicKey.slice(-6)}
              </p>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-blue-200 text-xs">XLM Balance</p>
                <p className="text-2xl font-bold">
                  {xlmBalance.toFixed(2)}{" "}
                  <span className="text-sm font-normal">XLM</span>
                </p>
              </div>
              <div>
                <p className="text-blue-200 text-xs">Token Pools</p>
                <p className="text-2xl font-bold">
                  {poolBalances.length}{" "}
                  <span className="text-sm font-normal">aset</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Investasi",
            value: stats.total.toString(),
            icon: Store,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Nilai Portfolio",
            value:
              stats.totalValue > 0
                ? `Rp ${(stats.totalValue / 1e6).toFixed(1)}Jt`
                : "Rp 0",
            icon: Briefcase,
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Campaign Aktif",
            value: stats.activeCampaigns.toString(),
            icon: PieChart,
            color: "text-orange-600 bg-orange-50",
          },
          {
            label: "Token Pool",
            value: poolBalances.length.toString(),
            icon: Wallet,
            color: "text-green-600 bg-green-50",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                card.color,
              )}
            >
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Investments list */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Daftar investasi
        </h2>

        {!isConnected && investments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Belum ada investasi
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Mulai berinvestasi di marketplace untuk membangun portfolio Anda.
            </p>
            <Link href="/investor/dashboard/marketplace">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Jelajahi Marketplace
              </Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat portofolio…
          </div>
        ) : investments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Belum ada investasi
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Mulai berinvestasi di marketplace untuk membangun portfolio Anda.
            </p>
            <Link href="/investor/dashboard/marketplace">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Jelajahi marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const statusCfg = STATUS_LABEL[inv.pool.status] || {
                label: inv.pool.status,
                cls: "bg-gray-100 text-gray-600",
              };
              const valueIDR = inv.tokensOwned * inv.pool.pricePerToken;

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 text-sm">
                        {inv.pool.brand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {inv.pool.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {inv.pool.brand.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase",
                        statusCfg.cls,
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progress Campaign</span>
                      <span className="font-semibold text-gray-900">
                        {inv.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${inv.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Token info */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">
                        Token DB
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {inv.tokensOwned}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">
                        Token On-chain
                      </p>
                      <p
                        className={cn(
                          "text-sm font-bold",
                          inv.onChainBalance > 0
                            ? "text-green-600"
                            : "text-gray-400",
                        )}
                      >
                        {inv.onChainBalance > 0 ? inv.onChainBalance : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">
                        Kepemilikan
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {inv.ownership}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">
                        Nilai Investasi
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        Rp {(valueIDR / 1e6).toFixed(2)}Jt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/investor/dashboard/marketplace/${inv.pool.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between border-gray-200 text-gray-700 h-8 text-xs group hover:bg-gray-50"
                      >
                        Detail Campaign
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      </Button>
                    </Link>
                    <a
                      href={getStellarExpertUrl(publicKey!, "account")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors border border-gray-200 rounded-lg"
                      title="Lihat di Stellar Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* On-chain token balances */}
      {isConnected && poolBalances.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>Token Stellar Terdeteksi</span>
            <span className="text-xs font-normal text-gray-400">
              dari {publicKey?.slice(0, 6)}…
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {poolBalances.map((b, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <p className="text-xs font-mono text-gray-500 truncate">
                  {b.assetCode}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {b.balance}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {b.issuer.slice(0, 8)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
