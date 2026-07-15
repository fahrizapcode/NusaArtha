"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Store, Briefcase, LineChart, Vote, ChevronRight,
  BadgeCheck, AlertCircle, Loader2, TrendingUp, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStellarWallet } from "@/lib/stellar/context";

type UserData = {
  id: string; name: string | null; email: string;
  isKYCVerified: boolean; role: string;
};

export default function InvestorHomePage() {
  const router = useRouter();
  const { isConnected, publicKey, xlmBalance } = useStellarWallet();
  const [user, setUser] = useState<UserData | null>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.user) { router.push("/login"); return; }
        if (d.user.role !== "INVESTOR") { router.push("/"); return; }
        setUser(d.user);
        // Load recent investments
        const res = await fetch(`/api/investments?investorId=${d.user.id}`);
        const inv = await res.json();
        setInvestments(inv.investments?.slice(0, 3) || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );

  const isKYC = user?.isKYCVerified;
  const greeting = user?.name ? `Halo, ${user.name.split(" ")[0]}!` : "Halo, Investor!";

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="text-2xl font-bold mt-1">{greeting}</h1>
            {isKYC
              ? <div className="flex items-center gap-1.5 mt-2 text-green-300 text-sm"><BadgeCheck className="w-4 h-4" /> Akun Terverifikasi</div>
              : <div className="flex items-center gap-1.5 mt-2 text-yellow-300 text-sm"><AlertCircle className="w-4 h-4" /> KYC belum selesai</div>}
          </div>
          {isConnected && publicKey && (
            <div className="text-right hidden sm:block">
              <p className="text-blue-200 text-xs font-mono">{publicKey.slice(0, 6)}…{publicKey.slice(-4)}</p>
              <p className="text-xl font-bold">{xlmBalance.toFixed(2)} XLM</p>
            </div>
          )}
        </div>
      </div>

      {/* KYC banner */}
      {!isKYC && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Verifikasi identitas (KYC) diperlukan</p>
              <p className="text-xs text-yellow-700 mt-0.5">Selesaikan KYC untuk dapat berinvestasi di platform.</p>
            </div>
          </div>
          <Link href="/investor/verify">
            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white flex-shrink-0">
              Verifikasi Sekarang
            </Button>
          </Link>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Marketplace", href: "/investor/dashboard/marketplace", icon: Store, color: "bg-blue-50 text-blue-600" },
          { label: "Portfolio", href: "/investor/dashboard/portfolio", icon: Briefcase, color: "bg-indigo-50 text-indigo-600" },
          { label: "Monitoring", href: "/investor/dashboard/monitoring", icon: Activity, color: "bg-green-50 text-green-600" },
          { label: "Revenue", href: "/investor/dashboard/revenue", icon: LineChart, color: "bg-purple-50 text-purple-600" },
        ].map((nav) => (
          <Link key={nav.href} href={nav.href}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center group">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", nav.color)}>
              <nav.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{nav.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent investments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Investasi Terbaru</h2>
          <Link href="/investor/dashboard/portfolio" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {investments.length === 0 ? (
          <div className="py-12 text-center">
            <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-3">Belum ada investasi.</p>
            <Link href="/investor/dashboard/marketplace">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Jelajahi Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {investments.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {inv.pool.brand.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inv.pool.name}</p>
                    <p className="text-xs text-gray-500">{inv.tokensOwned} token · {inv.pool.brand.name}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-blue-600">
                    Rp {((inv.tokensOwned * inv.pool.pricePerToken) / 1e6).toFixed(2)}Jt
                  </p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                    inv.pool.status === "OPERATING" ? "bg-green-50 text-green-700"
                    : inv.pool.status === "PUBLISHED" || inv.pool.status === "ACTIVE" ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-600")}>
                    {inv.pool.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
