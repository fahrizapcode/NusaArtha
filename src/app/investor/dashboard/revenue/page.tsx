"use client";

import { Button } from "@/components/ui/button";
import { LineChart, Wallet, ArrowDownToLine, History } from "lucide-react";

const REVENUE_DATA = [
  { outlet: "Outlet BSD City", period: "Juli 2026", amount: "Rp 1.200.000", status: "Pending" },
  { outlet: "Outlet BSD City", period: "Juni 2026", amount: "Rp 1.150.000", status: "Selesai" },
  { outlet: "Outlet Cihampelas", period: "Juni 2026", amount: "Rp 950.000", status: "Selesai" },
  { outlet: "Outlet BSD City", period: "Mei 2026", amount: "Rp 1.050.000", status: "Selesai" },
];

export default function RevenuePage() {
  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Revenue sharing</h1>
        <p className="text-sm text-gray-500 mt-1">Lacak pencairan dana bagi hasil dari seluruh investasi Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Sepanjang Waktu</p>
            <p className="text-2xl font-bold text-gray-900">Rp 4.350.000</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Bulan Ini (Juli)</p>
            <p className="text-2xl font-bold text-gray-900">Rp 1.200.000</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-orange-200 bg-orange-50/50 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
            <History className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-orange-800 uppercase">Pending Distribution</p>
            <p className="text-2xl font-bold text-orange-700">Rp 1.200.000</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-100 to-transparent pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Riwayat Distribusi Keseluruhan</h2>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
            <ArrowDownToLine className="w-3.5 h-3.5" /> Download CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outlet</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Periode</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nominal</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {REVENUE_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{row.outlet}</td>
                  <td className="px-5 py-4 text-gray-600">{row.period}</td>
                  <td className="px-5 py-4 font-bold text-green-600">{row.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${
                      row.status === "Selesai" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
