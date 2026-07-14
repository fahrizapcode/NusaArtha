"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Store,
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CampaignDetailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"review" | "active" | "rejected">("review");

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke campaign outlet
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">O</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Outlet BSD City</h1>
            <p className="text-sm text-gray-500">Kopi Nusantara · Tangerang Selatan</p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide",
          status === "review" ? "bg-orange-50 text-orange-700" :
          status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {status === "review" ? "Menunggu review" : status === "active" ? "Campaign aktif" : "Ditolak"}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Informasi Outlet */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Store className="w-4 h-4 text-gray-400" /> Informasi outlet</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Nama outlet</p><p className="font-medium text-gray-900">Outlet BSD City</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Lokasi</p><p className="font-medium text-gray-900">Tangerang Selatan, Banten</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Konsep outlet</p><p className="font-medium text-gray-900">Dine-in & Takeaway (Ruko)</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Operator</p><p className="font-medium text-gray-900">Ahmad Fauzi</p></div>
              <div className="col-span-2"><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Target buka</p><p className="font-medium text-gray-900">September 2026</p></div>
            </div>
          </section>

          {/* Pendanaan */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-gray-400" /> Pendanaan</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Target dana</p><p className="font-bold text-gray-900">Rp 250.000.000</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Harga token</p><p className="font-medium text-gray-900">Rp 100.000 / token</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Supply token</p><p className="font-medium text-gray-900">2.500 token</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Minimal pembelian</p><p className="font-medium text-gray-900">10 token (Rp 1.000.000)</p></div>
            </div>
          </section>

          {/* Proyeksi Bisnis */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /> Proyeksi bisnis</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Omzet / bulan</p><p className="font-bold text-gray-900">Rp 75.000.000</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Profit / bulan</p><p className="font-bold text-gray-900">Rp 15.000.000</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Estimasi ROI</p><p className="font-medium text-gray-900 text-green-600">18 - 24% p.a</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Estimasi BEP</p><p className="font-medium text-gray-900">14 - 18 Bulan</p></div>
            </div>
          </section>

          {/* Due Diligence */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /> Due diligence</h2>
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Legalitas lokasi</p>
                <p className="text-sm text-gray-600">Sertifikat hak milik ruko atas nama brand valid. Izin usaha (NIB) cabang sudah terbit dan sesuai peruntukan.</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Analisis pasar</p>
                <p className="text-sm text-gray-600">Lokasi strategis dekat kampus dan area perumahan padat penduduk. Tingkat kepadatan lalu lintas pejalan kaki tinggi pada sore-malam hari.</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Risiko operasional</p>
                <p className="text-sm text-gray-600">Risiko utama adalah persaingan dengan 2 kedai kopi lokal lainnya dalam radius 500m. Mitigasi melalui program loyalitas dan harga kompetitif.</p>
              </div>
              <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-4">
                <p className="font-semibold text-yellow-800 text-sm mb-2">Catatan reviewer</p>
                <p className="text-sm text-yellow-700">Semua dokumen lengkap. Proyeksi ROI masuk akal berdasarkan data historis brand di area serupa. Layak untuk dipublikasikan.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Revenue Sharing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-400" /> Revenue sharing</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Investor</span>
                  <span className="font-bold text-gray-900">80%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Brand</span>
                  <span className="font-bold text-gray-900">5%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "5%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Operator</span>
                  <span className="font-bold text-gray-900">15%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: "15%" }} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {status === "review" && (
              <div className="mt-8 space-y-2">
                <Button
                  onClick={() => setStatus("active")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Publikasikan campaign
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Minta revisi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStatus("rejected")}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Tolak campaign
                </Button>
              </div>
            )}
            {status === "active" && (
              <div className="mt-8 p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium text-center border border-green-200">
                ✓ Campaign aktif di marketplace
              </div>
            )}
            {status === "rejected" && (
              <div className="mt-8 p-3 bg-red-50 rounded-xl text-sm text-red-600 font-medium text-center border border-red-200">
                ✗ Campaign ditolak
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
