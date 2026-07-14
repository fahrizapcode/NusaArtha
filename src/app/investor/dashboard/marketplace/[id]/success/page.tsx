"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getStellarExpertUrl } from "@/lib/stellar/network";
import { useStellarWallet } from "@/lib/stellar/context";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const txHash = searchParams.get("tx") || "";
  const tokens = searchParams.get("tokens") || "0";
  const poolName = searchParams.get("pool") || "Outlet";
  const { publicKey } = useStellarWallet();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Investasi Berhasil!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Token <strong>{poolName}</strong> telah berhasil ditambahkan ke Stellar wallet Anda.
        </p>

        {/* Summary box */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Token dibeli</span>
            <span className="font-semibold text-gray-900">{tokens} token</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Blockchain</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-blue-600" /> Stellar Network
            </span>
          </div>
          {publicKey && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Wallet</span>
              <span className="font-mono text-xs text-gray-700">
                {publicKey.slice(0, 8)}…{publicKey.slice(-6)}
              </span>
            </div>
          )}
          {txHash && (
            <div className="pt-2 border-t border-gray-100">
              <a
                href={getStellarExpertUrl(txHash, "tx")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm text-blue-600 hover:underline"
              >
                <span>Lihat di Stellar Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-xs font-mono text-gray-400 mt-1 truncate">{txHash}</p>
            </div>
          )}
        </div>

        {/* Audit trail notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 text-xs text-blue-700 text-left">
          Transaksi ini telah dicatat secara permanen di jaringan Stellar dan dapat diverifikasi secara publik kapan saja.
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/investor/dashboard/portfolio">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              Lihat Portfolio saya
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/investor/dashboard/marketplace">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700">
              Kembali ke Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
