"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Users,
  Store,
  Clock,
  ClipboardList
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OutletDetailPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke monitoring outlet
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">O</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Outlet Cihampelas</h1>
            <p className="text-sm text-gray-500">Kopi Nusantara · Bandung</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Score</span>
            <span className="text-sm font-bold text-green-700">92</span>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide bg-green-50 text-green-700">
            Beroperasi
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Outlet */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Store className="w-4 h-4 text-gray-400" /> Progress outlet</h2>
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {[
                  { title: "Pendanaan selesai", date: "10 Ags 2026", done: true },
                  { title: "Outlet dibangun", date: "15 Ags 2026", done: true },
                  { title: "Training operator", date: "25 Ags 2026", done: true },
                  { title: "Grand opening", date: "1 Sep 2026", done: true },
                  { title: "Beroperasi", date: "Saat ini", done: true, current: true },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", step.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                      {step.current ? <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /> : step.done ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                    </div>
                    <div className="pt-1.5">
                      <p className={cn("text-sm font-semibold", step.done ? "text-gray-900" : "text-gray-500")}>{step.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Performa Bisnis */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /> Performa bisnis</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Omzet bulanan</p>
                <p className="text-lg font-bold text-gray-900">Rp 82.5M</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Laba bersih</p>
                <p className="text-lg font-bold text-green-600">Rp 16.5M</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hidden md:block">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Transaksi</p>
                <p className="text-lg font-bold text-gray-900">1,245</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Omzet harian avg</p>
                <p className="text-lg font-bold text-gray-900">Rp 2.7M</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Avg Order Value</p>
                <p className="text-lg font-bold text-gray-900">Rp 66K</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Biaya operasional</p>
                <p className="text-lg font-bold text-red-600">Rp 35M</p>
              </div>
            </div>

            {/* Dummy Line Chart (Visual Only) */}
            <div className="h-48 w-full bg-gray-50 rounded-xl border border-gray-100 flex items-end px-4 py-4 gap-2 relative">
              <div className="absolute top-4 left-4 text-xs font-medium text-gray-400">Grafik omzet bulanan (simulasi)</div>
              {[40, 50, 45, 60, 55, 70, 80, 75, 85, 95, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-200 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-medium transition-opacity whitespace-nowrap">
                    Minggu {i+1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Revenue Sharing */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-400" /> Revenue sharing</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase mb-0.5">Investor (40%)</p>
                  <p className="font-bold text-blue-900">Rp 6.600.000</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded-xl">
                <div>
                  <p className="text-xs text-green-600 font-medium uppercase mb-0.5">Brand (45%)</p>
                  <p className="font-bold text-green-900">Rp 7.425.000</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <div>
                  <p className="text-xs text-orange-600 font-medium uppercase mb-0.5">Operator (15%)</p>
                  <p className="font-bold text-orange-900">Rp 2.475.000</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Distribusi terakhir</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" /> 1 Okt 2026</span>
            </div>
          </section>

          {/* Operator */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Operator</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Ahmad Fauzi</p>
                <p className="text-xs text-gray-500">Rating: ⭐ 4.8 / 5.0</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Performa</span><span className="font-medium text-green-600">Sangat Baik</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Lama bekerja</span><span className="font-medium text-gray-900">1 Tahun 2 Bulan</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Outlet dikelola</span><span className="font-medium text-gray-900">3 Outlet</span></div>
            </div>
          </section>

          {/* Catatan Monitoring */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-gray-400" /> Catatan monitoring</h2>
            <textarea
              readOnly
              className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none outline-none"
              defaultValue="Operasional berjalan lancar bulan ini. Terjadi lonjakan penjualan pada minggu ke-2 karena event lokal di area sekitar outlet. SOP kebersihan dan stok bahan baku diterapkan dengan sangat baik oleh operator."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
