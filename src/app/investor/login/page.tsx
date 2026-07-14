"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function InvestorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal login. Periksa kembali email dan password Anda.");
      }

      if (data.user.role === "INVESTOR") {
        router.push("/investor/dashboard/marketplace");
      } else {
        throw new Error("Akun ini bukan akun Investor.");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="h-16 px-6 sm:px-12 flex items-center justify-between bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="NusaArtha" className="h-6" />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side: Form */}
          <div className="flex-1 p-8 sm:p-12">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Masuk sebagai Investor</h1>
                <p className="text-sm text-gray-500">Mulai dan kelola portofolio franchise Anda.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Password
                    </label>
                    <a href="#" className="text-xs text-blue-600 font-medium hover:underline">Lupa password?</a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-6">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Belum punya akun?{" "}
                <Link href="/investor/register" className="text-blue-600 font-semibold hover:underline">
                  Daftar di sini
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex-col justify-center border-l border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mengapa Investasi di NusaArtha?</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Passive Income Terukur</h4>
                  <p className="text-sm text-gray-600 mt-1">Sistem bagi hasil otomatis dan transparan berkat integrasi Point of Sale real-time.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Diversifikasi Mudah</h4>
                  <p className="text-sm text-gray-600 mt-1">Miliki sebagian dari berbagai outlet franchise ternama mulai dari modal kecil.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Due Diligence Ketat</h4>
                  <p className="text-sm text-gray-600 mt-1">Setiap campaign outlet telah melewati kurasi kelayakan bisnis oleh tim profesional.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
