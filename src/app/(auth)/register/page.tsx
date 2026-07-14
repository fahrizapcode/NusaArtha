"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, TrendingUp, CheckCircle2, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("INVESTOR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftar. Silakan periksa kembali data Anda.");
      }

      router.push("/login");
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
          <Store className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">NusaArtha</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col md:flex-row flex-row-reverse"
        >
          {/* Left Side: Form (Actually right visually due to flex-row-reverse) */}
          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
                <p className="text-sm text-gray-500">Bergabung dengan ekosistem waralaba pertama di Indonesia.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nama Anda"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Tipe Akun (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    <option value="INVESTOR">Investor</option>
                    <option value="BRAND_OWNER">Brand Owner</option>
                    <option value="OPERATOR">Operator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftar Sekarang"}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Features (Actually left visually) */}
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 flex-col justify-center border-r border-gray-100 relative overflow-hidden">
            <div className="absolute top-10 left-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-8 leading-tight">Mulai Perjalanan Anda<br/>Bersama NusaArtha</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Registrasi Mudah</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Pilih role Anda dan lengkapi profil dalam hitungan menit.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-purple-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Satu Akun, Multi Akses</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Tidak perlu membuat banyak akun untuk kebutuhan yang berbeda.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Privasi Terjaga</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Data Anda dienkripsi dan diamankan dengan standar industri.</p>
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
