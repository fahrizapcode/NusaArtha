"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, LineChart, Banknote, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function InvestorRegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/investor/verify"); // Simulate going to KYC
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="h-16 px-6 sm:px-12 flex items-center justify-between bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Kembali ke Beranda</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col md:flex-row-reverse"
        >
          {/* Right Side: Form */}
          <div className="flex-1 p-8 sm:p-12">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Investor</h1>
                <p className="text-sm text-gray-500">Mulai langkah pertama Anda menuju kebebasan finansial.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Nama lengkap
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap Anda"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <Button type="button" onClick={() => router.push("/investor/verify")} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-6">
                  Daftar
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Sudah punya akun?{" "}
                <Link href="/investor/login" className="text-blue-600 font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </div>
            </div>
          </div>

          {/* Left Side: Features */}
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 p-12 flex-col justify-center border-r border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mulai Berinvestasi Hari Ini</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Akses Pendanaan Terkurasi</h4>
                  <p className="text-sm text-gray-600 mt-1">Dapatkan akses ke brand-brand potensial yang telah melewati uji kelayakan ketat.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Dashboard Monitoring Real-time</h4>
                  <p className="text-sm text-gray-600 mt-1">Pantau perkembangan outlet dan omzet harian secara langsung dari dashboard Anda.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Investasi Aman & Terstruktur</h4>
                  <p className="text-sm text-gray-600 mt-1">Struktur legal yang jelas dan perlindungan investor yang diutamakan oleh platform.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
