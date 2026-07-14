"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Clock,
  TrendingUp,
  ShieldCheck,
  Star,
  Download,
  ChevronDown,
  Info,
  Banknote,
  PieChart,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CampaignDetailPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openDD, setOpenDD] = useState<number | null>(0);

  return (
    <div className="max-w-[1000px] mx-auto pb-32">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group mb-6"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-48 md:h-64 bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-800 shadow-lg">
                K
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Campaign Aktif</span>
                  <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Brand
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Outlet BSD City</h1>
                <p className="text-white/80 font-medium">Kopi Nusantara</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-between bg-white">
          <div className="flex-1 w-full">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Dana Terkumpul</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">Rp 175 Jt</span>
                  <span className="text-sm text-gray-500">dari Rp 250 Jt</span>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-600">70%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[70%]" />
            </div>
          </div>
          
          <div className="w-full md:w-auto shrink-0 flex gap-3">
            <Link href="/investor/dashboard/marketplace/1/invest" className="w-full">
              <Button size="lg" className="w-full md:w-48 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                Investasi sekarang
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Tentang Outlet */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tentang outlet</h2>
            <div className="prose prose-sm text-gray-600 max-w-none mb-6">
              <p>Outlet BSD City merupakan cabang strategis ke-4 dari Kopi Nusantara, berlokasi di area perkantoran padat dengan traffic pejalan kaki yang tinggi. Outlet ini didesain dengan konsep "Grab & Go" untuk melayani para pekerja komuter.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Lokasi</p>
                  <p className="text-sm text-gray-900 font-medium">BSD City, Tangerang Selatan</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Luas Outlet</p>
                  <p className="text-sm text-gray-900 font-medium">35 m²</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Target Buka</p>
                  <p className="text-sm text-gray-900 font-medium">September 2026</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Konsep</p>
                  <p className="text-sm text-gray-900 font-medium">Grab & Go, Mini Dine-in</p>
                </div>
              </div>
            </div>
          </section>

          {/* Profil Brand */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profil brand</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 text-xl shrink-0">
                KN
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Kopi Nusantara</h3>
                <p className="text-sm text-gray-500 mb-2">Berdiri sejak 2023</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">3 Outlet Aktif</span>
                  <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Readiness Score: 92/100
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kopi Nusantara adalah brand kopi lokal yang berfokus pada biji kopi asli Indonesia dengan harga terjangkau. Memiliki pertumbuhan konsisten di atas 20% setiap bulannya pada 3 outlet yang sudah berjalan.
            </p>
          </section>

          {/* Revenue Sharing & Proyeksi */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Simulasi bagi hasil (revenue sharing)</h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-between items-center max-w-sm mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Omzet</p>
                    <p className="font-bold text-gray-900">100%</p>
                  </div>
                  <div className="w-8 border-t border-gray-300 border-dashed" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Opex</p>
                    <p className="font-bold text-red-500">-70%</p>
                  </div>
                  <div className="w-8 border-t border-gray-300 border-dashed" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Laba Bersih</p>
                    <p className="font-bold text-green-600">30%</p>
                  </div>
                </div>
                
                <div className="w-full max-w-sm border-t border-gray-200 pt-4 flex gap-2">
                  <div className="flex-1 bg-blue-100 text-blue-700 p-3 rounded-lg text-center">
                    <p className="text-xs font-semibold mb-1">Investor</p>
                    <p className="font-bold text-lg">50%</p>
                    <p className="text-[10px] opacity-70">dari laba</p>
                  </div>
                  <div className="flex-1 bg-indigo-100 text-indigo-700 p-3 rounded-lg text-center">
                    <p className="text-xs font-semibold mb-1">Brand</p>
                    <p className="font-bold text-lg">40%</p>
                    <p className="text-[10px] opacity-70">dari laba</p>
                  </div>
                  <div className="flex-1 bg-orange-100 text-orange-700 p-3 rounded-lg text-center">
                    <p className="text-xs font-semibold mb-1">Operator</p>
                    <p className="font-bold text-lg">10%</p>
                    <p className="text-[10px] opacity-70">dari laba</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4">Proyeksi Bisnis (Tahunan)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Est. Omzet</p>
                <p className="text-sm font-bold text-gray-900">Rp 600 Jt</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Est. Profit</p>
                <p className="text-sm font-bold text-green-600">Rp 180 Jt</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 bg-blue-50/50">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Est. ROI</p>
                <p className="text-sm font-bold text-blue-700">18 - 24%</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Est. BEP</p>
                <p className="text-sm font-bold text-gray-900">14 Bulan</p>
              </div>
            </div>
          </section>

          {/* Due Diligence */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Due diligence platform</h2>
            <div className="space-y-3">
              {[
                { title: "Verifikasi Legalitas", status: "Verified", text: "Perusahaan telah memiliki NIB, NPWP, dan sertifikasi halal." },
                { title: "Analisis Pasar & Lokasi", status: "Verified", text: "Lokasi BSD City memiliki traffic harian 1.200 orang dengan kompetisi menengah." },
                { title: "Supply Chain & SOP", status: "Verified", text: "SOP operasional lengkap. Bahan baku disuplai dari central kitchen terpusat." },
                { title: "Profil Risiko", status: "Medium", text: "Risiko utama adalah fluktuasi harga bahan baku kopi. Mitigasi: kontrak supplier 6 bulan." },
              ].map((dd, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenDD(openDD === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={cn("w-4 h-4", dd.status === "Verified" ? "text-green-500" : "text-orange-500")} />
                      <span className="font-semibold text-sm text-gray-900">{dd.title}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", openDD === i && "rotate-180")} />
                  </button>
                  {openDD === i && (
                    <div className="p-4 text-sm text-gray-600 border-t border-gray-100 bg-white leading-relaxed">
                      {dd.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6 relative">
          
          {/* Invest Card (Sticky) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Informasi Pendanaan</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Jumlah Investor</span>
                <span className="font-semibold text-gray-900">12 Orang</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Sisa Waktu</span>
                <span className="font-semibold text-orange-600">18 Hari Lagi</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6 space-y-4">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Tokenomics</h4>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Harga per Token</span>
                <span className="font-bold text-blue-600">Rp 100.000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Supply</span>
                <span className="font-semibold text-gray-900">2.500 Token</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Sisa Token</span>
                <span className="font-semibold text-gray-900">750 Token</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Min. Pembelian</span>
                <span className="font-semibold text-gray-900">10 Token (Rp 1 Jt)</span>
              </div>
            </div>

            <Link href="/investor/dashboard/marketplace/1/invest" className="block w-full">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                Investasi sekarang
              </Button>
            </Link>
          </div>

          {/* Operator */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Operator outlet</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                AF
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Ahmad Fauzi</p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="font-semibold text-gray-700">4.8</span>
                  <span className="text-gray-400">(Score)</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium text-gray-900">Pengalaman:</span> 4 Tahun di F&B</p>
              <p><span className="font-medium text-gray-900">Outlet Dikelola:</span> 2 Outlet sukses</p>
            </div>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              Disediakan dan disertifikasi oleh NusaArtha Academy untuk memastikan operasional harian berjalan sesuai SOP.
            </p>
          </div>

          {/* Dokumen */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Dokumen pendukung</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-left">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Due Diligence Report</p>
                  <p className="text-[10px] text-gray-500">PDF • 2.4 MB</p>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-left">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Proyeksi Finansial</p>
                  <p className="text-[10px] text-gray-500">XLSX • 1.1 MB</p>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
