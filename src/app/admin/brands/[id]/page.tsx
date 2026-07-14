"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  FileText,
  TrendingUp,
  ClipboardList,
  Truck,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function BrandDetailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"review" | "approved" | "rejected">("review");

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke verifikasi brand
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">K</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kopi Nusantara</h1>
            <p className="text-sm text-gray-500">F&B · Diajukan 10 Jul 2026 oleh <span className="font-medium text-gray-700">Budi Santoso</span></p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide",
          status === "review" ? "bg-orange-50 text-orange-700" :
          status === "approved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {status === "review" ? "Menunggu review" : status === "approved" ? "Disetujui" : "Ditolak"}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">

          {/* Informasi Brand */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /> Informasi brand</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Nama brand</p><p className="font-medium text-gray-900">Kopi Nusantara</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Kategori</p><p className="font-medium text-gray-900">F&B – Minuman</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Tahun berdiri</p><p className="font-medium text-gray-900">2023</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Jumlah outlet</p><p className="font-medium text-gray-900">3 outlet aktif</p></div>
              <div className="col-span-2"><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Deskripsi</p><p className="text-gray-700 leading-relaxed">Brand kopi lokal berfokus pada biji kopi asli Indonesia dengan harga terjangkau. Pertumbuhan konsisten 20% per bulan.</p></div>
            </div>
          </section>

          {/* Legalitas */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Legalitas</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: "NIB", value: "8120001234567", status: true },
                { label: "NPWP", value: "12.345.678.9-000.000", status: true },
                { label: "Sertifikat merek", value: "No. IDM000123456", status: true },
                { label: "Identitas pemilik (KTP)", value: "Budi Santoso – 3174011001900001", status: true },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium">{doc.label}: <span className="text-gray-900">{doc.value}</span></span>
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                </div>
              ))}
            </div>
          </section>

          {/* Histori Bisnis */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /> Histori bisnis</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Omzet bulanan</p><p className="font-bold text-gray-900">Rp 85.000.000</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Transaksi/bulan</p><p className="font-bold text-gray-900">1.240 transaksi</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Produk utama</p><p className="font-medium text-gray-900">Kopi susu, cold brew</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Outlet aktif</p><p className="font-medium text-gray-900">Depok, Bekasi, Bogor</p></div>
            </div>
          </section>

          {/* SOP */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-gray-400" /> SOP operasional</h2>
            <div className="space-y-3 text-sm">
              {["SOP Operasional Harian", "SOP Pelayanan Pelanggan", "SOP Kebersihan & Sanitasi", "SOP Manajemen Stok"].map((sop, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-gray-800">{sop}</span>
                  <span className="ml-auto text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded uppercase">Lengkap</span>
                </div>
              ))}
            </div>
          </section>

          {/* Supply Chain */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /> Supply chain</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Supplier utama</p><p className="font-medium text-gray-900">PT Biji Nusantara Jaya</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Distribusi</p><p className="font-medium text-gray-900">Central kitchen Depok</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Logistik</p><p className="font-medium text-gray-900">Armada sendiri (2 kendaraan)</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Lead time</p><p className="font-medium text-gray-900">1–2 hari kerja</p></div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Brand Readiness */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-1">Brand readiness score</h3>
            <p className="text-xs text-gray-500 mb-4">Hasil penilaian kelayakan ekspansi</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">92</span>
              <span className="text-gray-400 text-sm mb-1">/ 100</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }} />
            </div>
            <div className="space-y-2">
              {[
                { label: "Legalitas", done: true },
                { label: "Histori keuangan", done: true },
                { label: "SOP lengkap", done: true },
                { label: "Supply chain", done: true },
                { label: "Brand awareness", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", item.done ? "bg-green-100" : "bg-gray-100")}>
                    {item.done && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                  </div>
                  <span className={item.done ? "text-gray-900" : "text-gray-400"}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {status === "review" && (
              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => setStatus("approved")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Setujui brand
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
                  Tolak brand
                </Button>
              </div>
            )}
            {status === "approved" && (
              <div className="mt-6 p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium text-center border border-green-200">
                ✓ Brand telah disetujui
              </div>
            )}
            {status === "rejected" && (
              <div className="mt-6 p-3 bg-red-50 rounded-xl text-sm text-red-600 font-medium text-center border border-red-200">
                ✗ Brand ditolak
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
