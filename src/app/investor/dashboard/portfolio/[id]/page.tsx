"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
  Banknote,
  Percent,
  Download
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TIMELINE = [
  { label: "Campaign Selesai", done: true },
  { label: "Pencairan Dana ke Brand", done: true },
  { label: "Pembangunan Outlet", done: true },
  { label: "Outlet Beroperasi", done: true },
  { label: "Distribusi Revenue Pertama", done: false, active: true },
];

const DISTRIBUTION_HISTORY = [
  { date: "15 Jul 2026", period: "Juni 2026", amount: "Rp 1.200.000", status: "Selesai", hash: "0x8f2...9a1" },
  { date: "15 Jun 2026", period: "Mei 2026", amount: "Rp 1.150.000", status: "Selesai", hash: "0x3b1...4c2" },
  { date: "15 Mei 2026", period: "April 2026", amount: "Rp 1.050.000", status: "Selesai", hash: "0x5d9...2e8" },
];

export default function PortfolioDetailPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group mb-2"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Portfolio
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Outlet BSD City</h1>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Beroperasi
            </span>
          </div>
          <p className="text-sm text-gray-500">Kopi Nusantara</p>
        </div>
        <Link href="/investor/dashboard/marketplace/1">
          <Button variant="outline" className="border-gray-200 text-gray-700 shadow-sm">
            Lihat Halaman Publik
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nilai Investasi</p>
          <p className="text-xl font-bold text-gray-900">Rp 10.000.000</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kepemilikan</p>
          <p className="text-xl font-bold text-gray-900">4.0% <span className="text-sm font-medium text-gray-400 normal-case">(100 Token)</span></p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total ROI</p>
          <p className="text-xl font-bold text-green-600">34%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-blue-50/50 shadow-sm">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Total Profit Diterima</p>
          <p className="text-xl font-bold text-blue-700">Rp 3.400.000</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 space-y-6">
          
          {/* Outlet Performance */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Performa Outlet (Bulan Ini)</h2>
              <span className="text-xs text-gray-500">Juli 2026</span>
            </div>
            
            <div className="p-6">
              <div className="flex gap-6 mb-8">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Omzet Kotor</p>
                  <p className="text-lg font-bold text-gray-900">Rp 85.000.000</p>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +12% vs bulan lalu
                  </span>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Biaya Operasional</p>
                  <p className="text-lg font-bold text-red-500">- Rp 55.000.000</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Laba Bersih</p>
                  <p className="text-lg font-bold text-green-600">Rp 30.000.000</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Bagian Anda (4%)</p>
                  <p className="text-xs text-gray-500">Estimasi pencairan tgl 15 Agustus</p>
                </div>
                <p className="text-xl font-bold text-blue-600">Rp 1.200.000</p>
              </div>
            </div>
          </section>

          {/* Distribution History */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Riwayat Distribusi</h2>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                <Download className="w-3.5 h-3.5" /> Laporan
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Periode Omzet</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Nominal</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {DISTRIBUTION_HISTORY.map((hist, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-900">{hist.date}</td>
                      <td className="px-5 py-3 text-gray-600">{hist.period}</td>
                      <td className="px-5 py-3 font-semibold text-green-600">{hist.amount}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase">
                          {hist.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-blue-500 hover:underline cursor-pointer font-mono">{hist.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-6">Timeline Proyek</h2>
            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-100" />
              <div className="space-y-6 relative z-10">
                {TIMELINE.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    {step.done ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 bg-white" />
                    ) : step.active ? (
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                    ) : (
                      <CircleDashed className="w-6 h-6 text-gray-300 flex-shrink-0 bg-white" />
                    )}
                    <div>
                      <p className={cn("text-sm font-semibold leading-snug pt-0.5", step.done ? "text-gray-900" : step.active ? "text-blue-700" : "text-gray-400")}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-4 text-center">
              <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-sm">Segera Hadir</span>
              <p className="text-sm font-medium text-white drop-shadow-md">Kamera CCTV live untuk investor</p>
            </div>
            <h2 className="font-bold text-gray-900 mb-4 opacity-50">Live CCTV</h2>
            <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
          </section>
        </div>
      </div>
    </div>
  );
}
