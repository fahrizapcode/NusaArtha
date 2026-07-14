"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 sm:p-12 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Investasi Berhasil! 🎉</h1>
        <p className="text-gray-500 mb-8">
          Terima kasih, pembayaran Anda telah kami terima. Token kepemilikan Anda sekarang aktif.
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Nama Outlet</span>
            <span className="font-semibold text-gray-900">Outlet BSD City</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Jumlah Token</span>
            <span className="font-semibold text-gray-900">10 Token</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Nilai Investasi</span>
            <span className="font-semibold text-gray-900">Rp 1.000.000</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-mono text-xs text-gray-900 bg-gray-200 px-2 py-1 rounded">TRX-982374982</span>
          </div>
        </div>

        <Link href="/investor/dashboard/portfolio">
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 text-base">
            Lihat Portfolio Saya <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
