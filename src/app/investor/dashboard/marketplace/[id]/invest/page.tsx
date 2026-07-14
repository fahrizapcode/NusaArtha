"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InvestPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState(10);
  const tokenPrice = 100000;

  const total = tokens * tokenPrice;
  const ownership = ((tokens / 2500) * 100).toFixed(2);

  return (
    <div className="max-w-[600px] mx-auto py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke detail campaign
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Investasi outlet</h1>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-8 border border-gray-100">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-gray-800 shadow-sm text-lg">
            K
          </div>
          <div>
            <p className="font-bold text-gray-900">Outlet BSD City</p>
            <p className="text-sm text-gray-500">Kopi Nusantara</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-gray-700">Jumlah token</label>
              <span className="text-xs text-gray-500">1 token = Rp 100.000</span>
            </div>
            <input
              type="number"
              min={1}
              value={tokens}
              onChange={(e) => setTokens(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1.5">Min. 10 token direkomendasikan</p>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Ringkasan pembelian</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Jumlah token</span>
              <span className="font-semibold text-gray-900">{tokens} token</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Persentase kepemilikan</span>
              <span className="font-semibold text-gray-900">{ownership}%</span>
            </div>
            <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total investasi</span>
              <span className="text-xl font-bold text-blue-700">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <Link href="/investor/dashboard/marketplace/1/payment">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base">
              Lanjut pembayaran
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
