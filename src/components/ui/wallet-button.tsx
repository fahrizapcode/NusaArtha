"use client";
// src/components/ui/wallet-button.tsx
// Freighter wallet connect button – dipakai di semua halaman yang butuh wallet

import { useState } from "react";
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown, AlertCircle } from "lucide-react";
import { useStellarWallet } from "@/lib/stellar/context";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import { cn } from "@/lib/utils";
import { FREIGHTER_DOWNLOAD_URL } from "@/lib/stellar/config";

type Props = {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md";
};

export function WalletButton({ className, variant = "default", size = "md" }: Props) {
  const { isConnected, isFreighterInstalled, isCheckingInstall, isConnecting, publicKey, xlmBalance, connect, disconnect, network } =
    useStellarWallet();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const short = publicKey
    ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`
    : null;

  // Masih loading (cek apakah Freighter terinstall)
  if (isCheckingInstall) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-xl font-medium text-sm",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2",
          "border border-gray-200 bg-gray-50 text-gray-400",
          className
        )}
      >
        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
        Wallet...
      </div>
    );
  }

  // Not installed
  if (!isFreighterInstalled) {
    return (
      <a
        href={FREIGHTER_DOWNLOAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border font-medium transition-colors text-sm",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2",
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
          className
        )}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        Install Freighter
      </a>
    );
  }

  // Connected
  if (isConnected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu((s) => !s)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl font-medium transition-all text-sm",
            size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2",
            variant === "outline"
              ? "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
              : "bg-blue-600 text-white hover:bg-blue-700",
            className
          )}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono">{short}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showMenu && "rotate-180")} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Stellar Wallet</p>
                <p className="font-mono text-xs text-gray-800 truncate">{publicKey}</p>
                <p className="text-xs text-gray-500 mt-1.5">
                  {xlmBalance.toFixed(2)} XLM ·{" "}
                  <span className="capitalize">{network?.toLowerCase() || "testnet"}</span>
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                  {copied ? "Disalin!" : "Salin Public Key"}
                </button>
                <a
                  href={getStellarExpertUrl(publicKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  Lihat di Explorer
                </a>
                <button
                  onClick={() => { disconnect(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Not connected
  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl font-medium transition-all text-sm",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2",
        variant === "outline"
          ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20",
        isConnecting && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Menghubungkan..." : "Connect Freighter"}
    </button>
  );
}
