"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { ArrowLeft, Wallet, ExternalLink, AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStellarWallet } from "@/lib/stellar/context";
import { hasTrustline, establishTrustline, getTokenBalance } from "@/lib/stellar/assets";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type PoolData = {
  id: string;
  name: string;
  pricePerToken: number;
  totalSupply: number;
  smartContractAddr?: string;
  brand: { name: string };
  investments: { tokensOwned: number }[];
};

export default function InvestPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;

  const { isConnected, publicKey, networkPassphrase, refreshBalances } = useStellarWallet();

  const [tokens, setTokens] = useState(10);
  const [pool, setPool] = useState<PoolData | null>(null);
  const [loadingPool, setLoadingPool] = useState(true);
  const [myBalance, setMyBalance] = useState(0);
  const [trustlineOk, setTrustlineOk] = useState(false);
  const [checkingTrustline, setCheckingTrustline] = useState(false);
  const [step, setStep] = useState<"input" | "trustline" | "confirm" | "processing" | "success" | "error">("input");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [collected, setCollected] = useState(0);

  // Load pool data
  useEffect(() => {
    if (!poolId) return;
    fetch(`/api/pools/${poolId}`)
      .then((r) => r.json())
      .then((d) => {
        setPool(d.pool);
        setCollected(d.collected || 0);
      })
      .finally(() => setLoadingPool(false));
  }, [poolId]);

  // Check trustline when wallet connects
  useEffect(() => {
    if (!publicKey || !pool) return;
    setCheckingTrustline(true);
    Promise.all([
      hasTrustline(publicKey, poolId),
      getTokenBalance(publicKey, poolId),
    ]).then(([trust, bal]) => {
      setTrustlineOk(trust);
      setMyBalance(bal);
      setCheckingTrustline(false);
    });
  }, [publicKey, pool, poolId]);

  if (loadingPool || !pool) {
    return (
      <div className="max-w-[600px] mx-auto py-16 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data kampanye…
      </div>
    );
  }

  const tokenPrice = pool.pricePerToken;
  const totalIDR = tokens * tokenPrice;
  const tokensSold = pool.investments.reduce((s, i) => s + i.tokensOwned, 0);
  const available = pool.totalSupply - tokensSold;
  const ownershipPct = ((tokens / pool.totalSupply) * 100).toFixed(2);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleEstablishTrustline = async () => {
    if (!publicKey) {
      setErrorMsg("Wallet belum terhubung. Hubungkan Freighter terlebih dahulu.");
      setStep("error");
      return;
    }
    setStep("processing");
    try {
      // networkPassphrase bisa null jika context belum ter-set, assets.ts akan fallback ke config
      const res = await establishTrustline(publicKey, poolId, networkPassphrase);
      if (res.success) {
        setTrustlineOk(true);
        setStep("input");
      } else {
        const msg = res.error || "Gagal membuat trustline";
        setErrorMsg(msg);
        setStep("error");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan tak terduga saat membuat trustline");
      setStep("error");
    }
  };

  const handleInvest = async () => {
    if (!publicKey) return;
    setStep("processing");

    // 1. Record investment in DB
    const dbRes = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poolId, tokensOwned: tokens, walletAddress: publicKey }),
    });

    if (!dbRes.ok) {
      const err = await dbRes.json();
      setErrorMsg(err.error || "Gagal mencatat investasi");
      setStep("error");
      return;
    }

    // 2. Mint tokens server-side (platform signs, no Freighter needed here)
    const mintRes = await fetch("/api/investments/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poolId, investorPublicKey: publicKey, tokenAmount: tokens }),
    });

    const mintData = await mintRes.json();

    if (mintData.success) {
      setTxHash(mintData.txHash);
      await refreshBalances();
      setStep("success");
    } else {
      setErrorMsg(mintData.error || "Transaksi Stellar gagal");
      setStep("error");
    }
  };

  // ─── Render steps ────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="max-w-[560px] mx-auto py-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Investasi Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-6">
            {tokens} token <strong>{pool.brand.name}</strong> telah ditambahkan ke wallet Stellar Anda.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Token dibeli</span>
              <span className="font-semibold">{tokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kepemilikan</span>
              <span className="font-semibold">{ownershipPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total investasi</span>
              <span className="font-semibold">Rp {totalIDR.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {txHash && (
            <a
              href={getStellarExpertUrl(txHash, "tx")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
            >
              <ExternalLink className="w-4 h-4" />
              Lihat transaksi di Stellar Explorer
            </a>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/investor/dashboard/portfolio")}
            >
              Portfolio saya
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/investor/dashboard/marketplace")}
            >
              Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="max-w-[560px] mx-auto py-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Transaksi Gagal</h2>
          <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-6 text-left">{errorMsg}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
              Coba lagi
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="max-w-[560px] mx-auto py-16 flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="font-semibold text-gray-900">Memproses transaksi Stellar…</p>
        <p className="text-sm text-gray-500">Mohon tunggu, jangan tutup halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke detail kampanye
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-xl font-bold text-gray-800">
            {pool.brand.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{pool.name}</p>
            <p className="text-sm text-gray-500">{pool.brand.name}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Wallet Connect */}
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Hubungkan <strong>Freighter Wallet</strong> untuk membeli token di jaringan Stellar.
                </p>
              </div>
              <WalletButton size="sm" className="flex-shrink-0" />
            </div>
          )}

          {/* Trustline check */}
          {isConnected && !checkingTrustline && !trustlineOk && step === "input" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Trustline Diperlukan</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Anda perlu membuat trustline untuk menerima token pool ini di wallet Stellar Anda.
                    Ini hanya perlu dilakukan sekali.
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-mono">
                    Network: {networkPassphrase ? (networkPassphrase.includes("Test") ? "TESTNET ✓" : networkPassphrase.slice(0,20)+"…") : "Dari config (TESTNET)"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={handleEstablishTrustline}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Buat Trustline
                </Button>
                {process.env.NODE_ENV === "development" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTrustlineOk(true)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                  >
                    Skip (Dev Only)
                  </Button>
                )}
              </div>
            </div>
          )}

          {isConnected && trustlineOk && myBalance > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Anda sudah memiliki <strong>{myBalance}</strong> token dari pool ini.
            </div>
          )}

          {/* Token amount input */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-gray-700">Jumlah token</label>
              <span className="text-xs text-gray-500">
                Tersedia: <strong>{available}</strong> token
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={available}
              value={tokens}
              onChange={(e) => setTokens(Math.max(1, Math.min(available, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
            />
            <div className="flex gap-2 mt-2">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setTokens(Math.min(n, available))}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-lg border transition-colors",
                    tokens === n
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Ringkasan pembelian</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Jumlah token</span>
              <span className="font-semibold text-gray-900">{tokens} token</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Harga per token</span>
              <span className="font-semibold text-gray-900">
                Rp {tokenPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Kepemilikan ekonomi</span>
              <span className="font-semibold text-gray-900">{ownershipPct}%</span>
            </div>
            <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total investasi</span>
              <span className="text-xl font-bold text-blue-700">
                Rp {totalIDR.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Stellar info */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Token akan diterbitkan di jaringan <strong>Stellar</strong> sebagai aset representasi hak
              ekonomi. Transaksi dicatat permanen di blockchain dan dapat diverifikasi secara publik.
            </span>
          </div>

          {/* CTA */}
          {isConnected ? (
            <Button
              size="lg"
              onClick={handleInvest}
              disabled={!trustlineOk || tokens < 1 || tokens > available}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base gap-2 disabled:bg-blue-300"
            >
              <Wallet className="w-5 h-5" />
              Beli {tokens} Token via Freighter
            </Button>
          ) : (
            <WalletButton className="w-full justify-center h-12 text-base" />
          )}

          <p className="text-center text-xs text-gray-400">
            Dengan melanjutkan, Anda menyetujui syarat & ketentuan platform dan memahami risiko investasi.
          </p>
        </div>
      </div>
    </div>
  );
}
