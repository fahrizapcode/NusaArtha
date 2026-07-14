"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Data pribadi", desc: "Informasi identitas dasar" },
  { label: "Upload identitas", desc: "KTP, selfie, dan NPWP" },
  { label: "Verifikasi rekening", desc: "Rekening penerima bagi hasil" },
  { label: "Persetujuan risiko", desc: "Konfirmasi syarat & ketentuan" },
];

export default function InvestorVerifyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/investor/dashboard/marketplace");
      }, 2500);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <BadgeCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Verified Investor</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi berhasil!</h1>
          <p className="text-gray-500 text-sm">Akun Anda telah terverifikasi. Mengarahkan ke marketplace...</p>
          <div className="mt-6 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="h-16 px-6 sm:px-12 flex items-center justify-between bg-white border-b border-gray-100">
        <Link href="/investor/login" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Kembali</span>
        </Link>
        <span className="text-sm font-semibold text-gray-900">Verifikasi KYC</span>
      </nav>

      <div className="flex-1 flex flex-col items-center py-10 px-4">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi investor</h1>
          <p className="text-sm text-gray-500">Lengkapi proses verifikasi identitas agar dapat mulai berinvestasi.</p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold">
              <span className="text-gray-500">Progress</span>
              <span className="text-blue-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={false}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Step Dots */}
            <div className="flex justify-between">
              {STEPS.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 w-1/4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                    idx < currentStep ? "bg-blue-600 border-blue-600 text-white" :
                    idx === currentStep ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50" :
                    "bg-white border-gray-200 text-gray-400"
                  )}>
                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium text-center hidden sm:block leading-tight",
                    idx <= currentStep ? "text-gray-800" : "text-gray-400"
                  )}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900">{STEPS[currentStep].label}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{STEPS[currentStep].desc}</p>
                </div>

                {/* STEP 1: Data Pribadi */}
                {currentStep === 0 && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      { label: "Nama lengkap", type: "text", placeholder: "John Doe" },
                      { label: "Email", type: "email", placeholder: "john@email.com" },
                      { label: "Nomor HP", type: "tel", placeholder: "08xx xxxx xxxx" },
                      { label: "Tanggal lahir", type: "date", placeholder: "" },
                    ].map((field, i) => (
                      <div key={i}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
                        <input type={field.type} placeholder={field.placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Negara</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option>Indonesia</option>
                        <option>Singapore</option>
                        <option>Malaysia</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Alamat lengkap</label>
                      <textarea rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
                    </div>
                  </div>
                )}

                {/* STEP 2: Upload Identitas */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    {["KTP / Passport", "Selfie memegang KTP", "NPWP (opsional)"].map((label, i) => (
                      <div key={i}>
                        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{label}</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center bg-gray-50 hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer">
                          <UploadCloud className="w-7 h-7 text-blue-400 mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Klik untuk upload</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau PDF — Maks. 5MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 3: Verifikasi Rekening */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800 leading-relaxed">Rekening ini digunakan untuk menerima distribusi revenue sharing setiap bulannya.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nama bank</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option>BCA</option><option>Mandiri</option><option>BNI</option><option>BRI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nomor rekening</label>
                      <input type="text" placeholder="1234567890" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nama pemilik rekening</label>
                      <input type="text" placeholder="Sesuai KTP" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                )}

                {/* STEP 4: Persetujuan Risiko */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm text-gray-600 space-y-3 leading-relaxed">
                      <p className="font-semibold text-gray-900">Deklarasi risiko investasi</p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Investasi pada bisnis franchise melibatkan risiko kehilangan sebagian atau seluruh modal.</li>
                        <li>Proyeksi ROI dan bagi hasil bukan merupakan jaminan keuntungan pasti.</li>
                        <li>Token kepemilikan hanya dapat ditransaksikan sesuai ketentuan platform.</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="mt-1 accent-blue-600 w-4 h-4 cursor-pointer" />
                        <span className="text-sm text-gray-700">Saya menyatakan bahwa seluruh informasi yang diberikan adalah benar.</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="mt-1 accent-blue-600 w-4 h-4 cursor-pointer" />
                        <span className="text-sm text-gray-700">Saya memahami bahwa investasi memiliki risiko dan menyetujui syarat & ketentuan platform.</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(curr => Math.max(0, curr - 1))}
                    className={cn("text-gray-500", currentStep === 0 && "invisible")}
                  >
                    Kembali
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                  >
                    {currentStep === STEPS.length - 1 ? "Kirim verifikasi" : "Selanjutnya"}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
