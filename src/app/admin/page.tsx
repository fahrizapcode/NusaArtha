"use client";

import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Megaphone,
  Store,
  Users,
  Wallet,
  TrendingUp,
  LineChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";

const STAT_CARDS = [
  { label: "Brand menunggu verifikasi", value: "4", icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/brands" },
  { label: "Campaign menunggu review", value: "2", icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/campaigns" },
  { label: "Campaign aktif", value: "8", icon: Globe, color: "text-green-600", bg: "bg-green-50", href: "/admin/campaigns" },
  { label: "Outlet beroperasi", value: "13", icon: Store, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/outlets" },
  { label: "Total investor", value: "348", icon: Users, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/analytics" },
  { label: "Total pendanaan", value: "Rp 4,2 M", icon: Wallet, color: "text-teal-600", bg: "bg-teal-50", href: "/admin/analytics" },
  { label: "Revenue sharing bulan ini", value: "Rp 320 Jt", icon: LineChart, color: "text-rose-600", bg: "bg-rose-50", href: "/admin/outlets" },
];

const ACTIVITIES = [
  { icon: ShieldCheck, color: "bg-orange-100 text-orange-600", text: "Brand Kopi Nusantara mengajukan verifikasi.", time: "2 menit lalu" },
  { icon: Megaphone, color: "bg-blue-100 text-blue-600", text: "Campaign Outlet Bandung diajukan oleh Ayam Geprek Maknyus.", time: "1 jam lalu" },
  { icon: CheckCircle2, color: "bg-green-100 text-green-600", text: "Campaign Outlet Bekasi berhasil dipublikasikan ke marketplace.", time: "3 jam lalu" },
  { icon: Store, color: "bg-indigo-100 text-indigo-600", text: "Outlet Cihampelas – Kopi Nusantara mulai beroperasi.", time: "Kemarin 14.00" },
  { icon: TrendingUp, color: "bg-purple-100 text-purple-600", text: "Revenue sharing bulan Juni berhasil didistribusikan ke 178 investor.", time: "2 hari lalu" },
  { icon: AlertCircle, color: "bg-yellow-100 text-yellow-600", text: "Brand Sneakers Lokal diminta melakukan revisi dokumen legalitas.", time: "3 hari lalu" },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard admin</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas platform NusaArtha.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <Link key={i} href={card.href} className="block">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", card.bg)}>
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-snug">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Aktivitas terbaru</h2>
        </div>
        <div className="p-5 space-y-5">
          {ACTIVITIES.map((activity, i) => (
            <div key={i} className="flex gap-4">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", activity.color)}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {activity.time}
                </p>
              </div>
              {i < ACTIVITIES.length - 1 && (
                <div className="absolute ml-4 mt-9 h-5 w-0.5 bg-gray-100" style={{ left: "2.25rem" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
