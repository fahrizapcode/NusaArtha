"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { cn } from "@/lib/utils";
import {
  Wallet, Shield, Bell, User, ExternalLink, Copy,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { useStellarWallet } from "@/lib/stellar/context";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import { STELLAR_NETWORK, FREIGHTER_DOWNLOAD_URL } from "@/lib/stellar/config";

export default function SettingsPage() {
  const { isConnected, publicKey, xlmBalance, network, isFreighterInstalled, connect, disconnect, fundTestnet } =
    useStellarWallet();
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);
  const [funded, setFunded] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFundTestnet = async () => {
    setFunding(true);
    const ok = await fundTestnet();
    if (ok) setFunded(true);
    setFunding(false);
  };

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola wallet dan preferensi akun Anda.</p>
      </div>

      {/* Wallet section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="p-6">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" /> Stellar Wallet
          </h2>
          <p className="text-sm text-gray-500">
            NusaArtha menggunakan Freighter Wallet untuk transaksi di jaringan Stellar.
          </p>
        </div>

        <div className="p-6">
          {!isFreighterInstalled ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Freighter belum terpasang</p>
                <p className="text-xs text-gray-500">Install ekstensi Freighter untuk dapat berinvestasi dan menerima revenue.</p>
              </div>
              <a href={FREIGHTER_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Install Freighter
                </Button>
              </a>
            </div>
          ) : !isConnected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Wallet belum terhubung</p>
                <p className="text-xs text-gray-500">Hubungkan Freighter untuk mengakses fitur investasi.</p>
              </div>
              <WalletButton size="sm" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected state */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Public Key</p>
                  <p className="font-mono text-sm text-gray-800 break-all">{publicKey}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
                  title="Salin"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Network</p>
                  <p className="font-semibold capitalize">{network?.toLowerCase() || STELLAR_NETWORK.toLowerCase()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">XLM Balance</p>
                  <p className="font-semibold">{xlmBalance.toFixed(2)} XLM</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="font-semibold text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Terhubung
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={getStellarExpertUrl(publicKey!, "account")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs">
                    <ExternalLink className="w-3.5 h-3.5" /> Explorer
                  </Button>
                </a>
                {STELLAR_NETWORK === "TESTNET" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFundTestnet}
                    disabled={funding || funded}
                    className={cn("gap-1.5 border-gray-200 text-xs", funded && "border-green-200 text-green-700")}
                  >
                    {funded ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    {funding ? "Meminta XLM…" : funded ? "Berhasil +10.000 XLM" : "Minta Testnet XLM (Friendbot)"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 text-xs ml-auto"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KYC section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="p-6">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" /> Verifikasi Identitas (KYC)
          </h2>
          <p className="text-sm text-gray-500">Status verifikasi identitas untuk kepatuhan platform.</p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">KYC Belum Lengkap</p>
              <p className="text-xs text-amber-700 mt-0.5">Selesaikan verifikasi identitas untuk mengakses semua fitur investasi.</p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0">
              Verifikasi
            </Button>
          </div>
        </div>
      </section>

      {/* Notification section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="p-6">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" /> Notifikasi
          </h2>
          <p className="text-sm text-gray-500">Atur preferensi pemberitahuan.</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Revenue sharing diterima", desc: "Notifikasi saat ada distribusi revenue ke wallet Anda", enabled: true },
            { label: "Update status outlet", desc: "Perubahan status operasional outlet investasi Anda", enabled: true },
            { label: "Governance proposal", desc: "Ada proposal voting baru untuk pool Anda", enabled: false },
            { label: "Campaign baru", desc: "Campaign investasi baru tersedia di marketplace", enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors flex-shrink-0 mt-0.5",
                  item.enabled ? "bg-blue-600" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm",
                  item.enabled ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* App info */}
      <div className="text-center text-xs text-gray-400 pb-4 space-y-1">
        <p>NusaArtha v0.1.0 · Stellar {STELLAR_NETWORK}</p>
        <p>Platform Ekspansi UMKM Indonesia berbasis Blockchain</p>
      </div>
    </div>
  );
}
