"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChevronRight, Store, Star } from "lucide-react";
import Link from "next/link";

const OPERATORS = [
  { id: 1, name: "Ahmad Fauzi", brand: "Kopi Nusantara", outlet: "3 Outlet", score: 95, status: "Aktif" },
  { id: 2, name: "Budi Santoso", brand: "Ayam Geprek Maknyus", outlet: "2 Outlet", score: 88, status: "Aktif" },
  { id: 3, name: "Citra Kirana", brand: "Burger Bangor", outlet: "1 Outlet", score: 75, status: "Dalam pelatihan" },
  { id: 4, name: "Dewi Lestari", brand: "Martabak Bogor", outlet: "4 Outlet", score: 92, status: "Aktif" },
  { id: 5, name: "Eko Prasetyo", brand: "Kopi Nusantara", outlet: "2 Outlet", score: 65, status: "Under review" },
  { id: 6, name: "Fajar Ramadhan", brand: "Ayam Geprek Maknyus", outlet: "5 Outlet", score: 98, status: "Aktif" },
];

const STATUS_STYLES: Record<string, string> = {
  "Aktif": "bg-green-50 text-green-700",
  "Dalam pelatihan": "bg-blue-50 text-blue-700",
  "Under review": "bg-orange-50 text-orange-700",
};

export default function AdminOperatorsPage() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Operator</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola dan pantau kinerja seluruh operator pengelola outlet.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama operator..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Semua", "Aktif", "Dalam pelatihan", "Under review"].map((f) => (
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
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama operator</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand mitra</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Outlet dikelola</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Performa</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {OPERATORS.map((op) => (
              <tr key={op.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                      {op.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{op.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{op.brand}</td>
                <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                  <span className="flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-gray-400" /> {op.outlet}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <Star className={cn("w-3.5 h-3.5", op.score >= 90 ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                    <span className={cn("font-bold text-xs", op.score >= 90 ? "text-green-600" : op.score >= 70 ? "text-yellow-600" : "text-red-600")}>
                      {op.score} / 100
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide", STATUS_STYLES[op.status])}>
                    {op.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/operators/${op.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200">
                      Lihat <ChevronRight className="w-3 h-3" />
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
