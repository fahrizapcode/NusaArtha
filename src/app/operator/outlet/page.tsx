"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Store, MapPin, TrendingUp, ArrowRight, Loader2, MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type OutletRow = {
  id: string;
  name: string;
  location: string;
  status: string;
  poolName: string;
  brandName: string;
  monthlyRevenue: number;
  txCount: number;
};

export default function OperatorOutletPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const me = await meRes.json();
      const res = await fetch(`/api/operator/outlets?operatorId=${me.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat outlet…
      </div>
    );
  }

  const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Beroperasi", cls: "bg-green-50 text-green-700 border border-green-200" },
    OPERATING: { label: "Beroperasi", cls: "bg-green-50 text-green-700 border border-green-200" },
    PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    BUILDING: { label: "Dibangun", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    CLOSED: { label: "Ditutup", cls: "bg-red-50 text-red-600 border border-red-200" },
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Outlet Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Daftar outlet yang Anda kelola. Total: {outlets.length}</p>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Store className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada outlet yang ditugaskan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {outlets.map((o) => {
            const cfg = STATUS_CFG[o.status.toUpperCase()] || { label: o.status, cls: "bg-gray-100 text-gray-600" };
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{o.name}</h3>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", cfg.cls)}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{o.brandName} · {o.poolName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                  <MapPin className="w-3.5 h-3.5" />{o.location}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Revenue</p>
                    <p className="text-sm font-bold text-gray-900">
                      {o.monthlyRevenue > 0 ? `Rp ${(o.monthlyRevenue / 1e6).toFixed(1)}Jt` : "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Transaksi</p>
                    <p className="text-sm font-bold text-gray-900">{o.txCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Status</p>
                    <p className={cn("text-xs font-bold", cfg.cls.includes("green") ? "text-green-700" : "text-gray-700")}>
                      {cfg.label}
                    </p>
                  </div>
                </div>

                <Link href={`/operator/pos?outletId=${o.id}`}>
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
  );
}
