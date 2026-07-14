"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PackagePlus,
  MapPin,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Building2,
  Banknote,
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  draft: { label: "Draft", class: "bg-gray-100 text-gray-600" },
  review: { label: "Menunggu Review", class: "bg-amber-50 text-amber-700 border border-amber-200" },
  active: { label: "Aktif", class: "bg-green-50 text-green-700 border border-green-200" },
  inactive: { label: "Nonaktif", class: "bg-gray-100 text-gray-500" },
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_PACKAGES = [
  {
    name: "Paket Mikro",
    desc: "Cocok untuk area perumahan, food court, atau kantin.",
    locationTarget: "Kota Tier 2–3",
    minCapital: "Rp 18.750.000",
    maxCapital: "Rp 30.000.000",
    area: "12–20 m²",
    outlets: 2,
    status: "active",
  },
  {
    name: "Paket Standar",
    desc: "Optimal untuk ruko atau kios di pusat keramaian.",
    locationTarget: "Kota Tier 1–2",
    minCapital: "Rp 37.500.000",
    maxCapital: "Rp 55.000.000",
    area: "25–40 m²",
    outlets: 3,
    status: "active",
  },
  {
    name: "Paket Premium",
    desc: "Untuk lokasi strategis di pusat kota atau mal.",
    locationTarget: "Kota Tier 1",
    minCapital: "Rp 70.000.000",
    maxCapital: "Rp 100.000.000",
    area: "50–80 m²",
    outlets: 0,
    status: "review",
  },
];

// ─── Package Card Component ───────────────────────────────────────────────────
function PackageCard({ pkg, onClick }: { pkg: typeof DUMMY_PACKAGES[0], onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[pkg.status];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900">{pkg.name}</h3>
            <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", statusCfg.class)}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{pkg.desc}</p>
        </div>
        <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Capital Range */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs font-medium text-blue-700 mb-0.5">Kisaran Modal Outlet</p>
        <p className="text-lg font-bold text-blue-800">
          {pkg.minCapital} <span className="text-blue-500 font-normal text-sm">–</span> {pkg.maxCapital}
        </p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 text-xs mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
          <p className="font-semibold text-gray-800 leading-tight">{pkg.locationTarget}</p>
          <p className="text-gray-500 mt-0.5">Target Lokasi</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <Building2 className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
          <p className="font-semibold text-gray-800 leading-tight">{pkg.area}</p>
          <p className="text-gray-500 mt-0.5">Luas Outlet</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <Banknote className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
          <p className="font-semibold text-gray-800 leading-tight">{pkg.outlets}</p>
          <p className="text-gray-500 mt-0.5">Outlet Aktif</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <Button 
          onClick={onClick}
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 border-gray-200 text-gray-600 text-xs flex-1"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Paket
        </Button>
        <Button 
          onClick={onClick}
          size="sm" 
          className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
        >
          Lihat Detail
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function PaketOutletContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  const isEmpty = false;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Paket Outlet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola jenis paket dan kisaran modal untuk setiap tipe pembukaan outlet.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-sm shadow-blue-600/15 flex-shrink-0">
          <PackagePlus className="w-4 h-4" />
          Buat Paket Baru
        </Button>
      </div>

      {isEmpty ? (
        // ─── Empty State ───────────────────────────────────────────────────────
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 px-8 text-center">
          <svg width="110" height="90" viewBox="0 0 110 90" fill="none" className="mb-6 opacity-40">
            <rect x="5" y="35" width="100" height="50" rx="10" fill="#E5E7EB" />
            <rect x="15" y="20" width="80" height="20" rx="7" fill="#D1D5DB" />
            <rect x="35" y="8" width="40" height="15" rx="6" fill="#9CA3AF" />
            <rect x="25" y="48" width="60" height="7" rx="3.5" fill="#9CA3AF" />
            <rect x="25" y="62" width="40" height="6" rx="3" fill="#D1D5DB" />
          </svg>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Belum Ada Paket Outlet</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
            Setiap paket mewakili jenis pembukaan outlet dengan kisaran modal dan spesifikasi lokasi yang berbeda.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2">
            <PackagePlus className="w-4 h-4" />
            Buat Paket Outlet
          </Button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari paket..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-gray-600 h-9">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
            <span className="ml-auto text-xs text-gray-500 font-medium">{DUMMY_PACKAGES.length} paket</span>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DUMMY_PACKAGES.map((pkg, i) => (
              <PackageCard 
                key={i} 
                pkg={pkg} 
                onClick={() => router.push(`/dashboard/paket-outlet/1?status=${status}`)} 
              />
            ))}

            {/* Add New Card */}
            <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all group min-h-[280px]">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <PackagePlus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="font-semibold text-gray-600 group-hover:text-blue-700 text-sm transition-colors">
                Tambah Paket Baru
              </p>
              <p className="text-xs text-gray-400 mt-1">Klik untuk membuat paket outlet</p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaketOutletPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8">Loading...</div>}>
      <PaketOutletContent />
    </Suspense>
  );
}
