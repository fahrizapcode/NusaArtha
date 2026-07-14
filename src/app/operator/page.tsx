"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Store, TrendingUp, Banknote, Activity, Loader2,
  MapPin, CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type OutletData = {
  id: string;
  name: string;
  location: string;
  status: string;
  poolName: string;
  brandName: string;
  monthlyRevenue: number;
  txCount: number;
};

type OperatorProfile = {
  id: string;
  name: string | null;
  email: string;
};

export default function OperatorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [outlets, setOutlets] = useState<OutletData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const me = await meRes.json();

      if (me.user.role !== "OPERATOR") {
        // Redirect ke dashboard yang sesuai
        if (me.user.role === "ADMIN") router.push("/admin");
        else if (me.user.role === "BRAND_OWNER") router.push("/dashboard");
        else router.push("/investor/dashboard/marketplace");
        return;
      }

      setProfile(me.user);

      // Fetch outlets yang dioperasikan
      const res = await fetch(`/api/operator/outlets?operatorId=${me.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat dashboard…
      </div>
    );
  }

  const totalRevenue = outlets.reduce((s, o) => s + o.monthlyRevenue, 0);
  const totalTx = outlets.reduce((s, o) => s + o.txCount, 0);
  const activeOutlets = outlets.filter((o) => ["ACTIVE", "OPERATING"].includes(o.status.toUpperCase())).length;

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Beroperasi", cls: "bg-green-50 text-green-700 border border-green-200" },
    OPERATING: { label: "Beroperasi", cls: "bg-green-50 text-green-700 border border-green-200" },
    PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    BUILDING: { label: "Dibangun", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    CLOSED: { label: "Ditutup", cls: "bg-red-50 text-red-600 border border-red-200" },
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center text-lg font-bold">
            {(profile?.name || profile?.email || "O").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Selamat datang, {profile?.name || "Operator"}</h1>
            <p className="text-sm text-gray-500">
              {outlets.length === 0
                ? "Anda belum ditugaskan ke outlet manapun."
                : `Anda mengelola ${outlets.length} outlet aktif.`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Outlet Aktif", value: activeOutlets.toString(), icon: Store, color: "text-orange-600 bg-orange-50" },
          { label: "Total Outlet", value: outlets.length.toString(), icon: Activity, color: "text-blue-600 bg-blue-50" },
          { label: "Transaksi Bulan Ini", value: totalTx.toString(), icon: TrendingUp, color: "text-green-600 bg-green-50" },
          {
            label: "Revenue Bulan Ini",
            value: totalRevenue > 0 ? `Rp ${(totalRevenue / 1e6).toFixed(1)}Jt` : "Rp 0",
            icon: Banknote,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Outlet List */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Outlet yang Anda Kelola</h2>

        {outlets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <Store className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Belum ada outlet yang ditugaskan</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Tim NusaArtha akan menugaskan Anda ke outlet setelah proses seleksi dan training selesai.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {outlets.map((outlet) => {
              const statusKey = outlet.status.toUpperCase();
              const cfg = STATUS_LABEL[statusKey] || { label: outlet.status, cls: "bg-gray-100 text-gray-600" };
              return (
                <div key={outlet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{outlet.name}</h3>
                      <p className="text-xs text-gray-500">{outlet.brandName} · {outlet.poolName}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", cfg.cls)}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {outlet.location}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Revenue bulan ini</p>
                      <p className="text-sm font-bold text-gray-900">
                        {outlet.monthlyRevenue > 0 ? `Rp ${(outlet.monthlyRevenue / 1e6).toFixed(1)}Jt` : "—"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Transaksi</p>
                      <p className="text-sm font-bold text-gray-900">{outlet.txCount}</p>
                    </div>
                  </div>
                  <Link href={`/operator/pos?outletId=${outlet.id}`}>
                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-9 text-xs">
                      Input Transaksi POS <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box for unassigned operators */}
      {outlets.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 mb-1">Menunggu penugasan outlet</p>
            <p className="text-sm text-blue-700">
              Proses seleksi operator membutuhkan waktu. Tim NusaArtha akan menghubungi Anda melalui email setelah
              penugasan outlet selesai diproses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
