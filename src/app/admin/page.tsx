import { cn } from "@/lib/utils";
import {
  ShieldCheck, Megaphone, Store, Users, Wallet,
  TrendingUp, LineChart, Clock, CheckCircle2, AlertCircle, Globe,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Real stats from DB
  const [
    totalBrands,
    pendingBrands,
    totalPools,
    publishedPools,
    operatingPools,
    totalOutlets,
    operatingOutlets,
    totalInvestments,
    recentBrands,
    recentPools,
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.brand.count({ where: { riskLevel: "PENDING" } }),
    prisma.investmentPool.count(),
    prisma.investmentPool.count({ where: { status: { in: ["PUBLISHED", "ACTIVE"] } } }),
    prisma.investmentPool.count({ where: { status: "OPERATING" } }),
    prisma.outlet.count(),
    prisma.outlet.count({ where: { status: "OPERATING" } }),
    prisma.investment.count(),
    prisma.brand.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { name: true, email: true } } },
    }),
    prisma.investmentPool.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { brand: { select: { name: true } } },
    }),
  ]);

  // Total funding collected
  const allInvestments = await prisma.investment.findMany({
    include: { pool: { select: { pricePerToken: true } } },
  });
  const totalFunding = allInvestments.reduce(
    (s, i) => s + i.tokensOwned * i.pool.pricePerToken, 0
  );

  const STAT_CARDS = [
    { label: "Brand menunggu verifikasi", value: pendingBrands.toString(), icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/brands" },
    { label: "Campaign menunggu review", value: (totalPools - publishedPools - operatingPools).toString(), icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/campaigns" },
    { label: "Campaign aktif", value: publishedPools.toString(), icon: Globe, color: "text-green-600", bg: "bg-green-50", href: "/admin/campaigns" },
    { label: "Outlet beroperasi", value: operatingOutlets.toString(), icon: Store, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/outlets" },
    { label: "Total investor", value: totalInvestments.toString(), icon: Users, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/analytics" },
    { label: "Total pendanaan", value: totalFunding > 0 ? `Rp ${(totalFunding / 1e9).toFixed(1)}M` : "Rp 0", icon: Wallet, color: "text-teal-600", bg: "bg-teal-50", href: "/admin/analytics" },
    { label: "Total brand", value: totalBrands.toString(), icon: LineChart, color: "text-rose-600", bg: "bg-rose-50", href: "/admin/brands" },
  ];

  // Build activity from recent data
  const activities = [
    ...recentBrands.map((b) => ({
      icon: ShieldCheck,
      color: "bg-orange-100 text-orange-600",
      text: `Brand ${b.name} mengajukan verifikasi.`,
      time: new Date(b.createdAt).toLocaleDateString("id-ID"),
    })),
    ...recentPools.map((p) => ({
      icon: Megaphone,
      color: "bg-blue-100 text-blue-600",
      text: `Campaign ${p.name} dibuat oleh ${p.brand.name}.`,
      time: new Date(p.createdAt).toLocaleDateString("id-ID"),
    })),
  ].slice(0, 6);

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

      {/* Summary row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Total Brand</p>
          <p className="text-3xl font-bold">{totalBrands}</p>
          <p className="text-blue-200 text-xs mt-1">{pendingBrands} menunggu review</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-green-100 text-xs font-medium uppercase tracking-wide mb-1">Total Pool</p>
          <p className="text-3xl font-bold">{totalPools}</p>
          <p className="text-green-100 text-xs mt-1">{publishedPools} aktif di marketplace</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-5 text-white">
          <p className="text-purple-200 text-xs font-medium uppercase tracking-wide mb-1">Total Outlet</p>
          <p className="text-3xl font-bold">{totalOutlets}</p>
          <p className="text-purple-200 text-xs mt-1">{operatingOutlets} sedang beroperasi</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Aktivitas terbaru</h2>
          <span className="text-xs text-gray-400">dari database</span>
        </div>
        <div className="p-5">
          {activities.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-5">
              {activities.map((activity, i) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
