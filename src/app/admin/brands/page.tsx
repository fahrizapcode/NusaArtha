"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, Clock, ShieldCheck, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

const BRANDS = [
  { id: 1, name: "Kopi Nusantara", category: "F&B", owner: "Budi Santoso", date: "10 Jul 2026", status: "Menunggu review" },
  { id: 2, name: "Ayam Geprek Maknyus", category: "F&B", owner: "Siti Rahayu", date: "8 Jul 2026", status: "Menunggu review" },
  { id: 3, name: "Burger Bangor", category: "F&B", owner: "Agus Wijaya", date: "5 Jul 2026", status: "Perlu revisi" },
  { id: 4, name: "Seblak Jeletot", category: "F&B", owner: "Dewi Kusuma", date: "3 Jul 2026", status: "Menunggu review" },
  { id: 5, name: "Martabak Bogor", category: "F&B", owner: "Hendra Gunawan", date: "1 Jul 2026", status: "Disetujui" },
  { id: 6, name: "Es Teh Nusantara", category: "F&B", owner: "Maya Putri", date: "28 Jun 2026", status: "Ditolak" },
];

const STATUS_STYLES: Record<string, string> = {
  "Menunggu review": "bg-orange-50 text-orange-700",
  "Perlu revisi": "bg-yellow-50 text-yellow-700",
  "Disetujui": "bg-green-50 text-green-700",
  "Ditolak": "bg-red-50 text-red-700",
};

export default function AdminBrandsPage() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Verifikasi brand</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola seluruh pengajuan brand yang akan bergabung ke platform.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari brand..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {["Semua", "Menunggu review", "Perlu revisi", "Disetujui", "Ditolak"].map((f) => (
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama brand</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Pemilik</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Tanggal pengajuan</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {BRANDS.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {brand.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{brand.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{brand.category}</td>
                <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{brand.owner}</td>
                <td className="px-5 py-4 text-gray-500 hidden lg:table-cell text-xs">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{brand.date}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", STATUS_STYLES[brand.status])}>
                    {brand.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/brands/${brand.id}`}>
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
