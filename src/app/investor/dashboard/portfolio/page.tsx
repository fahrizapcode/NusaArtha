"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  TrendingUp,
  Store,
  ChevronRight,
  PieChart
} from "lucide-react";
import Link from "next/link";

const PORTFOLIO_DATA = [
  {
    id: 1,
    brandName: "Kopi Nusantara",
    outletName: "Outlet BSD City",
    status: "Beroperasi",
    progress: 100,
    roi: "21%",
    lastRevenue: "Rp 1.200.000",
  },
  {
    id: 2,
    brandName: "Ayam Geprek Maknyus",
    outletName: "Outlet Cihampelas",
    status: "Dibangun",
    progress: 40,
    roi: "Menunggu",
    lastRevenue: "Rp 0",
  },
];

export default function PortfolioPage() {
  const isEmpty = false;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Portfolio investasi</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau perkembangan aset dan bagi hasil Anda.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Total Investasi</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Rp 15 Jt</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Total Nilai Portfolio</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">1</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Campaign Aktif</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Rp 1.2 Jt</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Bagi Hasil Bulan Ini</p>
        </div>
      </div>

      {/* List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar investasi</h2>
        
        {isEmpty ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada investasi</h3>
            <p className="text-sm text-gray-500 mb-6">Mulai berinvestasi di marketplace untuk membangun portfolio Anda.</p>
            <Link href="/investor/dashboard/marketplace">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Jelajahi marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {PORTFOLIO_DATA.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600">
                      {item.brandName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.outletName}</h3>
                      <p className="text-xs text-gray-500">{item.brandName}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase",
                    item.status === "Beroperasi" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                  )}>
                    {item.status}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>Progress Outlet</span>
                    <span className="font-semibold text-gray-900">{item.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Est. ROI</p>
                    <p className="text-sm font-bold text-gray-900">{item.roi}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Bagi Hasil Terakhir</p>
                    <p className="text-sm font-bold text-green-600">{item.lastRevenue}</p>
                  </div>
                </div>

                <Link href={`/investor/dashboard/portfolio/${item.id}`} className="mt-auto">
                  <Button variant="outline" className="w-full justify-between border-gray-200 text-gray-700 group hover:bg-gray-50">
                    Lihat detail
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
