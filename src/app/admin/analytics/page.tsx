"use client";

import {
  Store,
  Megaphone,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard statistik dan performa platform secara keseluruhan.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total brand", value: "142", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total campaign", value: "86", icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Campaign aktif", value: "12", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total outlet", value: "64", icon: Store, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total investor", value: "3.4K", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Dana dihimpun", value: "Rp 12M", icon: Wallet, color: "text-teal-600", bg: "bg-teal-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart Pertumbuhan Investor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Pertumbuhan investor</h2>
              <p className="text-xs text-gray-500">+12% dibanding bulan lalu</p>
            </div>
          </div>
          <div className="h-48 w-full flex items-end justify-between px-2 gap-2">
            {[40, 55, 60, 45, 70, 80, 95].map((h, i) => (
              <div key={i} className="w-full bg-purple-100 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-medium transition-opacity">
                  {h * 10}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2 font-medium">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span>
          </div>
        </div>

        {/* Chart Pendanaan Bulanan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Pendanaan bulanan (Miliar Rp)</h2>
              <p className="text-xs text-gray-500">Total akumulasi Rp 12.4M tahun ini</p>
            </div>
          </div>
          <div className="h-48 w-full flex items-end justify-between px-2 gap-2">
            {[30, 45, 80, 50, 60, 90, 75].map((h, i) => (
              <div key={i} className="w-full bg-teal-100 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-medium transition-opacity">
                  {(h / 10).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2 font-medium">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span>
          </div>
        </div>

        {/* Chart Pertumbuhan Brand */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-6">Pertumbuhan brand terverifikasi</h2>
          <div className="h-40 w-full flex items-end justify-between px-2 gap-2">
            {[20, 30, 45, 60, 75, 90, 100].map((h, i) => (
              <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Chart Pertumbuhan Outlet */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-6">Pertumbuhan outlet aktif</h2>
          <div className="h-40 w-full flex items-end justify-between px-2 gap-2">
            {[10, 20, 35, 45, 55, 70, 85].map((h, i) => (
              <div key={i} className="w-full bg-indigo-100 rounded-t-sm relative group" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
