"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Store,
  Star,
  Award,
  BookOpen,
  TrendingUp,
  MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OperatorDetailPage() {
  const router = useRouter();

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke operator
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ahmad Fauzi</h1>
            <p className="text-sm text-gray-500">Mitra Kopi Nusantara · Sejak Ags 2024</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">4.8</span>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide bg-green-50 text-green-700">
            Aktif (3 Outlet)
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Kinerja Keseluruhan */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-gray-400" /> Kinerja rata-rata</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Pencapaian target omzet</span>
                <span className="font-bold text-green-600">105%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Kepatuhan SOP</span>
                <span className="font-bold text-gray-900">92/100</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Kepuasan pelanggan</span>
                <span className="font-bold text-gray-900">4.8/5.0</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: "96%" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Riwayat Pelatihan */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> Riwayat pelatihan</h2>
          <div className="space-y-4 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-100" />
            {[
              { title: "Advanced Barista Training", date: "Jan 2026", status: "Lulus" },
              { title: "Customer Service Excellence", date: "Okt 2025", status: "Lulus" },
              { title: "Management Inventory", date: "Jul 2025", status: "Lulus dengan pujian" },
            ].map((t, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center z-10 shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.date} · <span className="text-green-600 font-medium">{t.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outlet yang dikelola */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Store className="w-4 h-4 text-gray-400" /> Outlet yang dikelola (3)</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Outlet Cihampelas", loc: "Bandung", omzet: "Rp 85M", target: "+5%", bg: "bg-green-50 text-green-700", trendIcon: TrendingUp },
              { name: "Outlet Dago", loc: "Bandung", omzet: "Rp 72M", target: "-2%", bg: "bg-red-50 text-red-700", trendIcon: TrendingUp },
              { name: "Outlet Setiabudi", loc: "Bandung", omzet: "Rp 91M", target: "+12%", bg: "bg-green-50 text-green-700", trendIcon: TrendingUp },
            ].map((out, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{out.name}</h3>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {out.loc}</p>
                <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Omzet bln ini</p>
                    <p className="font-bold text-gray-900">{out.omzet}</p>
                  </div>
                  <div className={cn("text-xs font-bold px-2 py-1 rounded flex items-center gap-1", out.bg)}>
                    {out.target}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
