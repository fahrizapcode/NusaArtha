"use client";

import { cn } from "@/lib/utils";
import {
  MapPin, Search, MoreHorizontal, Building2,
  User, Loader2, Store,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  ACTIVE:    { label: "Beroperasi",      class: "bg-green-50 text-green-700 border border-green-200" },
  OPERATING: { label: "Beroperasi",      class: "bg-green-50 text-green-700 border border-green-200" },
  BUILDING:  { label: "Sedang Dibangun", class: "bg-orange-50 text-orange-700 border border-orange-200" },
  PENDING:   { label: "Menunggu",        class: "bg-amber-50 text-amber-700 border border-amber-200" },
  CLOSED:    { label: "Tutup",           class: "bg-red-50 text-red-600 border border-red-200" },
};

type OutletRow = {
  id: string;
  name: string;
  poolName: string;
  location: string;
  city: string;
  openDate: string;
  operatorName: string;
  status: string;
  monthlyRevenue: number;
};

function OutletContent() {
  const router = useRouter();
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) { router.push("/login"); return; }
        const me = await meRes.json();

        const res = await fetch(`/api/outlets?ownerId=${me.user.id}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (!cancelled) setOutlets(data.outlets || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [router]);

  const filtered = outlets.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount   = outlets.filter((o) => ["ACTIVE", "OPERATING"].includes(o.status)).length;
  const buildingCount = outlets.filter((o) => ["BUILDING", "PENDING"].includes(o.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat outlet…
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Outlet</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau seluruh outlet yang beroperasi.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Outlet",  value: outlets.length, color: "bg-blue-50",   iconColor: "text-blue-600"  },
          { label: "Beroperasi",    value: activeCount,    color: "bg-green-50",  iconColor: "text-green-600" },
          { label: "Dibangun",      value: buildingCount,  color: "bg-orange-50", iconColor: "text-orange-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", s.color)}>
              <Building2 className={cn("w-4 h-4", s.iconColor)} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cari outlet atau kota..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Store className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada outlet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Outlet akan muncul setelah paket outlet Anda berhasil didanai dan admin menyetujui pembukaan outlet.
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Outlet</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Pool / Paket</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kota</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Operator</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Dibuka</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Omzet / Bulan</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((outlet) => {
                  const statusKey = outlet.status.toUpperCase();
                  const cfg = STATUS_CONFIG[statusKey] || { label: outlet.status, class: "bg-gray-100 text-gray-500" };
                  return (
                    <tr key={outlet.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {outlet.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{outlet.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {outlet.location.slice(0, 30)}{outlet.location.length > 30 ? "…" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                          {outlet.poolName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{outlet.city}</td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {outlet.operatorName || "Belum ditugaskan"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">{outlet.openDate}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {outlet.monthlyRevenue > 0
                          ? `Rp ${(outlet.monthlyRevenue / 1e6).toFixed(1)}Jt`
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", cfg.class)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <span className="text-xs text-gray-500">{filtered.length} outlet ditemukan</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutletPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-gray-400 p-8 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />Loading...
        </div>
      }
    >
      <OutletContent />
    </Suspense>
  );
}
