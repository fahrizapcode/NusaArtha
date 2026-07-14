"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Package,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Rocket,
  Banknote,
  TrendingUp,
  Clock,
  Check
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PACKAGE_DETAIL = {
  name: "Paket Mikro",
  desc: "Cocok untuk area perumahan, food court, atau kantin dengan ruang terbatas.",
  locationTarget: "Kota Tier 2–3",
  minCapital: "Rp 18.750.000",
  maxCapital: "Rp 30.000.000",
  area: "12–20 m²",
  status: "Siap",
};

const TIMELINE = [
  { label: "Campaign Dibuka", done: true, active: false },
  { label: "Pendanaan Berlangsung", done: false, active: true },
  { label: "Target Pendanaan Tercapai", done: false, active: false },
  { label: "Outlet Dibangun", done: false, active: false },
  { label: "Outlet Beroperasi", done: false, active: false },
];

function PackageDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  
  // State for campaign status
  const [campaignState, setCampaignState] = useState<"none" | "active">("none");
  const [showModal, setShowModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const handleAjukan = () => {
    if (isAgreed) {
      setShowModal(false);
      setCampaignState("active");
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-20">
      {/* Back button */}
      <button
        onClick={() => router.push(`/dashboard/paket-outlet?status=${status}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Paket Outlet
      </button>

      {/* Package Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{PACKAGE_DETAIL.name}</h1>
            <p className="text-sm text-gray-500 max-w-lg">{PACKAGE_DETAIL.desc}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start">
            {campaignState === "active" ? "🚀 Campaign Aktif" : PACKAGE_DETAIL.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Target Lokasi</p>
            <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
              <MapPin className="w-4 h-4 text-gray-400" />
              {PACKAGE_DETAIL.locationTarget}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Kebutuhan Ruang</p>
            <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
              <Building2 className="w-4 h-4 text-gray-400" />
              {PACKAGE_DETAIL.area}
            </div>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 font-medium mb-1">Kisaran Modal</p>
            <div className="flex items-center gap-1.5 text-blue-700 font-bold">
              <Banknote className="w-4 h-4 text-blue-600/60" />
              {PACKAGE_DETAIL.minCapital} - {PACKAGE_DETAIL.maxCapital}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION: CAMPAIGN PENDANAAN */}
      {/* ========================================================== */}
      
      <div className="pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Campaign Pendanaan</h2>
        
        <AnimatePresence mode="wait">
          {campaignState === "none" ? (
            // ─── Belum Menjadi Campaign ──────────────────────────────────
            <motion.div
              key="none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Menjadi Campaign</h3>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
                Paket outlet ini masih bersifat internal dan belum ditampilkan kepada investor.
                Apabila Anda membutuhkan pendanaan, Anda dapat mengajukan paket outlet ini sebagai campaign sehingga investor dapat mulai berinvestasi.
              </p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
              >
                Ajukan Campaign
              </Button>
            </motion.div>
          ) : (
            // ─── Campaign Aktif ──────────────────────────────────────────
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1 space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Campaign Sedang Berjalan</h3>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-gray-200 text-gray-700">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Campaign Investor
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-sm font-semibold text-green-600">Berjalan</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Dibuka Sejak</p>
                      <p className="text-sm font-semibold text-gray-900">Hari ini</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Target Dana</p>
                      <p className="text-sm font-semibold text-gray-900">Rp 30 Jt</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Investor</p>
                      <p className="text-sm font-semibold text-gray-900">0</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-bold text-gray-900">Rp 0</span>
                        <span className="text-xs text-gray-500 ml-1">dari Rp 30.000.000 terkumpul</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">0%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-blue-500 rounded-full w-[2%]" />
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-right">Sisa 30 Hari Campaign</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="md:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-6">Timeline Campaign</h3>
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
                            <p className={cn("text-sm font-semibold leading-snug", step.done ? "text-gray-900" : step.active ? "text-blue-700" : "text-gray-400")}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================== */}
      {/* MODAL: AJUKAN CAMPAIGN */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden flex flex-col max-h-full"
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Ajukan Campaign Pendanaan</h2>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Campaign yang diajukan akan langsung dipublikasikan ke Dashboard Investor (simulasi frontend), sehingga investor dapat melihat informasi outlet dan mulai melakukan pendanaan.
                  </p>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-xs font-semibold text-blue-800 mb-3 uppercase tracking-wider">Informasi Publik Investor</p>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside marker:text-blue-400">
                      <li>Nama Paket Outlet</li>
                      <li>Lokasi Outlet</li>
                      <li>Deskripsi Singkat</li>
                      <li>Target Pendanaan</li>
                      <li>Estimasi ROI / Revenue Sharing</li>
                      <li>Timeline Pembukaan Outlet</li>
                      <li>Profil Brand</li>
                      <li>Informasi Operator (jika sudah tersedia)</li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5 relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors"
                      />
                      <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-gray-700 select-none group-hover:text-gray-900 transition-colors">
                      Saya memastikan seluruh informasi pada paket outlet telah benar dan siap dipublikasikan ke publik.
                    </span>
                  </label>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="border-gray-200">
                    Batal
                  </Button>
                  <Button 
                    disabled={!isAgreed} 
                    onClick={handleAjukan}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300"
                  >
                    Ajukan Campaign
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PackageDetailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8">Loading...</div>}>
      <PackageDetailContent />
    </Suspense>
  );
}
