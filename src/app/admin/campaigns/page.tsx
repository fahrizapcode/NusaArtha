"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";

const CAMPAIGNS = [
  { id: 1, outlet: "Outlet BSD City", brand: "Kopi Nusantara", location: "Tangerang Selatan", target: "Rp 250 Jt", status: "Aktif", date: "5 Jul 2026" },
  { id: 2, outlet: "Outlet Cihampelas", brand: "Ayam Geprek Maknyus", location: "Bandung", target: "Rp 150 Jt", status: "Menunggu review", date: "9 Jul 2026" },
  { id: 3, outlet: "Outlet Sudirman", brand: "Burger Bangor", location: "Jakarta Pusat", target: "Rp 400 Jt", status: "Menunggu review", date: "10 Jul 2026" },
  { id: 4, outlet: "Outlet Margonda", brand: "Martabak Bogor", location: "Depok", target: "Rp 120 Jt", status: "Pendanaan selesai", date: "2 Jun 2026" },
  { id: 5, outlet: "Outlet Rungkut", brand: "Kopi Nusantara", location: "Surabaya", target: "Rp 200 Jt", status: "Aktif", date: "20 Jun 2026" },
  { id: 6, outlet: "Outlet Panakkukang", brand: "Ayam Geprek Maknyus", location: "Makassar", target: "Rp 180 Jt", status: "Ditolak", date: "15 Jun 2026" },
];

const STATUS_STYLES: Record<string, string> = {
  "Menunggu review": "bg-orange-50 text-orange-700",
  "Aktif": "bg-green-50 text-green-700",
  "Ditolak": "bg-red-50 text-red-700",
  "Pendanaan selesai": "bg-blue-50 text-blue-700",
};

export default function AdminCampaignsPage() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Campaign outlet</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola seluruh campaign outlet yang diajukan oleh brand.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari outlet atau brand..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Semua", "Menunggu review", "Aktif", "Pendanaan selesai", "Ditolak"].map((f) => (
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama outlet</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Brand</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Lokasi</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {CAMPAIGNS.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-gray-900">{c.outlet}</td>
                <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{c.brand}</td>
                <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                  <span className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3" />{c.location}</span>
                </td>
                <td className="px-5 py-4 font-medium text-gray-900">{c.target}</td>
                <td className="px-5 py-4">
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", STATUS_STYLES[c.status])}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500 hidden lg:table-cell">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.date}</span>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/campaigns/${c.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200">
                      Review <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
