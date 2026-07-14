"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  TrendingUp,
  Plus,
  Phone,
  User,
} from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Beroperasi", class: "bg-green-50 text-green-700 border border-green-200" },
  building: { label: "Sedang Dibangun", class: "bg-orange-50 text-orange-700 border border-orange-200" },
  closed: { label: "Tutup Sementara", class: "bg-red-50 text-red-600 border border-red-200" },
};

const DUMMY_OUTLETS = [
  {
    name: "Outlet BSD City",
    package: "Paket Standar",
    location: "Jl. Pahlawan No. 12, BSD City, Tangerang Selatan",
    city: "Tangerang Selatan",
    openDate: "Maret 2025",
    pic: "Ahmad Fauzi",
    phone: "0812-3456-7890",
    status: "active",
    monthlyRevenue: "Rp 48.000.000",
    growth: "+12%",
  },
  {
    name: "Outlet Cihampelas",
    package: "Paket Mikro",
    location: "Jl. Cihampelas No. 87, Bandung",
    city: "Bandung",
    openDate: "Juni 2025",
    pic: "Siti Rahma",
    phone: "0813-9876-5432",
    status: "active",
    monthlyRevenue: "Rp 31.500.000",
    growth: "+8%",
  },
  {
    name: "Outlet Sudirman",
    package: "Paket Premium",
    location: "Jl. Sudirman Kav. 45, Jakarta Pusat",
    city: "Jakarta Pusat",
    openDate: "—",
    pic: "Budi Santoso",
    phone: "0821-1234-5678",
    status: "building",
    monthlyRevenue: "—",
    growth: "—",
  },
  {
    name: "Outlet Malioboro",
    package: "Paket Mikro",
    location: "Jl. Malioboro No. 22, Yogyakarta",
    city: "Yogyakarta",
    openDate: "Januari 2025",
    pic: "Dewi Anjani",
    phone: "0814-5678-9012",
    status: "active",
    monthlyRevenue: "Rp 27.200.000",
    growth: "+5%",
  },
  {
    name: "Outlet Darmo",
    package: "Paket Standar",
    location: "Jl. Darmo No. 55, Surabaya",
    city: "Surabaya",
    openDate: "Mei 2025",
    pic: "Riko Setiawan",
    phone: "0817-2345-6789",
    status: "active",
    monthlyRevenue: "Rp 39.000.000",
    growth: "+15%",
  },
];

function OutletContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const me = await meRes.json();
      const res = await fetch(`/api/dashboard/brand?ownerId=${me.user.id}`);
      const data = await res.json();
      
      const allOutlets: any[] = [];
      if (data.pools) {
        data.pools.forEach((p: any) => {
          // If the pool has outlets, map them
          // Since our api/dashboard/brand might only return minimal outlet data,
          // let's create a placeholder based on the pool if it has operating outlets
          allOutlets.push({
            name: `${p.name} Outlet`,
            package: `Pool ${p.name}`,
            location: p.location,
            city: p.location.split(',').pop() || p.location,
            openDate: p.status === "OPERATING" ? "Sedang Beroperasi" : "Menunggu",
            pic: "Operator Assigned",
            phone: "-",
            status: p.status === "OPERATING" ? "active" : "building",
            monthlyRevenue: "Rp 0",
            growth: "0%",
          });
        });
      }
      setOutlets(allOutlets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const activeCount = outlets.filter((o) => o.status === "active").length;
  const buildingCount = outlets.filter((o) => o.status === "building").length;

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Memuat outlet...</div>;
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Outlet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau seluruh outlet yang beroperasi.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-sm shadow-blue-600/15 flex-shrink-0">
          <Plus className="w-4 h-4" />
          Tambah Outlet
        </Button>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{outlets.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Outlet</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{activeCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Beroperasi</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{buildingCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sedang Dibangun</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari outlet atau kota..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-gray-600 h-9">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </Button>
      </div>

      {/* Outlet Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Outlet</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kota</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PIC</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Buka Sejak</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Omzet / Bulan</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tren</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {outlets.map((outlet, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {outlet.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{outlet.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{outlet.location.slice(0, 32)}…
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                      {outlet.package}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{outlet.city}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {outlet.pic}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{outlet.openDate}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{outlet.monthlyRevenue}</td>
                  <td className="px-5 py-4">
                    {outlet.growth !== "—" ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {outlet.growth}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", STATUS_CONFIG[outlet.status]?.class)}>
                      {STATUS_CONFIG[outlet.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
          <span className="text-xs text-gray-500">{outlets.length} outlet ditemukan</span>
        </div>
      </div>
    </div>
  );
}

export default function OutletPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8">Loading...</div>}>
      <OutletContent />
    </Suspense>
  );
}
