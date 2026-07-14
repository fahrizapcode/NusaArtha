"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, TrendingUp, CheckCircle2, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "BRAND_OWNER") {
        router.push("/dashboard");
      } else if (data.user.role === "INVESTOR") {
        router.push("/investor/dashboard/marketplace");
      } else {
        router.push("/dashboard");
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
        <Link href="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium text-gray-600">Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="NusaArtha" className="h-6" />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side: Form */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Masuk ke Akun Anda</h1>
                <p className="text-sm text-gray-500">Gunakan satu akun untuk akses sebagai Investor, Brand, atau Admin.</p>
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk Sekarang"}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Belum punya akun?{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                  Daftar di sini
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex-col justify-center border-l border-gray-100 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-8 leading-tight">Satu Platform,<br/>Banyak Peluang Ekspansi</h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Investor</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Passive income dari franchise ternama.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Brand Owner</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Dapatkan pendanaan untuk buka outlet baru.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Transparan & Aman</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Berjalan di atas jaringan blockchain Stellar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
