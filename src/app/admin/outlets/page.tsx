"use client";

import { cn } from "@/lib/utils";
import { Search, MapPin, Store, AlertCircle, HardHat, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const OUTLETS = [
  { id: 1, name: "Outlet Cihampelas", brand: "Kopi Nusantara", location: "Bandung", operator: "Ahmad Fauzi", status: "Beroperasi", score: 92 },
  { id: 2, name: "Outlet Sudirman", brand: "Ayam Geprek Maknyus", location: "Jakarta Pusat", operator: "Budi Santoso", status: "Beroperasi", score: 88 },
  { id: 3, name: "Outlet Margonda", brand: "Burger Bangor", location: "Depok", operator: "Citra Kirana", status: "Dibangun", score: 0 },
  { id: 4, name: "Outlet BSD City", brand: "Martabak Bogor", location: "Tangerang Selatan", operator: "Dewi Lestari", status: "Bermasalah", score: 65 },
  { id: 5, name: "Outlet Kemang", brand: "Kopi Nusantara", location: "Jakarta Selatan", operator: "Eko Prasetyo", status: "Beroperasi", score: 95 },
  { id: 6, name: "Outlet Malioboro", brand: "Ayam Geprek Maknyus", location: "Yogyakarta", operator: "Fajar Ramadhan", status: "Beroperasi", score: 82 },
];

const STATS = [
  { label: "Total outlet", value: "48", icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Outlet beroperasi", value: "32", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
  { label: "Outlet dibangun", value: "14", icon: HardHat, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Outlet bermasalah", value: "2", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
];

const STATUS_STYLES: Record<string, string> = {
  "Beroperasi": "bg-green-50 text-green-700",
  "Dibangun": "bg-yellow-50 text-yellow-700",
  "Bermasalah": "bg-red-50 text-red-700",
};

export default function AdminOutletsPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Monitoring outlet</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau seluruh outlet yang telah berhasil didanai dan sedang berjalan.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama outlet, brand, atau operator..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {["Semua", "Beroperasi", "Dibangun", "Bermasalah"].map((f) => (
            <button
              key={f}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                f === "Semua" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OUTLETS.map((outlet) => (
          <div key={outlet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", STATUS_STYLES[outlet.status])}>
                  {outlet.status}
                </span>
                {outlet.status === "Beroperasi" && (
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Score</span>
                    <span className={cn("text-xs font-bold", outlet.score >= 90 ? "text-green-600" : outlet.score >= 70 ? "text-yellow-600" : "text-red-600")}>
                      {outlet.score}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{outlet.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{outlet.brand}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{outlet.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Store className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">Op: {outlet.operator}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <Link href={`/admin/outlets/${outlet.id}`} className="block">
                <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 h-9 text-xs shadow-sm">
                  Lihat detail <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
