"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, TrendingUp, PieChart, Users, Store,
  Clock, ClipboardList, Loader2, MapPin, ExternalLink,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type OutletDetail = {
  id: string;
  name: string;
  location: string;
  status: string;
  operator: { id: string; name: string | null; email: string; walletAddress: string | null } | null;
  pool: {
    id: string;
    name: string;
    pricePerToken: number;
    revenueShares: string;
    brand: { name: string };
    smartContractAddr?: string;
  };
  posTransactions: { id: string; amount: number; timestamp: string }[];
};

export default function OutletDetailPage() {
  const router = useRouter();
  const params = useParams();
  const outletId = params.id as string;

  const [outlet, setOutlet] = useState<OutletDetail | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outletId) return;
    fetch(`/api/outlets/${outletId}`)
      .then((r) => r.json())
      .then((d) => {
        setOutlet(d.outlet);
        setMonthlyRevenue(d.monthlyRevenue || 0);
        setTodayRevenue(d.todayRevenue || 0);
      })
      .finally(() => setLoading(false));
  }, [outletId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data outlet…
      </div>
    );
  }

  if (!outlet) {
    return <div className="text-center py-24 text-gray-500">Outlet tidak ditemukan.</div>;
  }

  const shares = (() => {
    try { return JSON.parse(outlet.pool.revenueShares); }
    catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; }
  })();

  // Compute weekly chart from posTransactions (last 7 days)
  const now = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (6 - i));
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const total = outlet.posTransactions
      .filter((tx) => {
        const t = new Date(tx.timestamp);
        return t >= day && t < nextDay;
      })
      .reduce((s, tx) => s + tx.amount, 0);
    return { day: day.toLocaleDateString("id-ID", { weekday: "short" }), total };
  });

  const maxDaily = Math.max(...weeklyData.map((d) => d.total), 1);
  const totalTransactions = outlet.posTransactions.length;
  const aov = totalTransactions > 0
    ? outlet.posTransactions.reduce((s, tx) => s + tx.amount, 0) / totalTransactions
    : 0;

  // Estimated revenue share (investor portion of monthly)
  const distributableCash = monthlyRevenue * 0.3; // assume 70% opex
  const investorShare = distributableCash * (shares.investor / 100);

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke monitoring outlet
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">
            {outlet.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{outlet.name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {outlet.location}
            </p>
            <p className="text-xs text-gray-400">{outlet.pool.brand.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide",
            outlet.status === "OPERATING" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          )}>
            {outlet.status}
          </span>
          {outlet.pool.smartContractAddr && (
            <a
              href={getStellarExpertUrl(outlet.pool.smartContractAddr, "account")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 border border-blue-100 bg-blue-50 px-2 py-1 rounded-lg"
            >
              <ExternalLink className="w-3 h-3" /> Stellar
            </a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Performa POS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" /> Performa bisnis (POS real-time)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Omzet Bulan Ini", val: `Rp ${(monthlyRevenue / 1e6).toFixed(1)}Jt`, color: "text-gray-900" },
                { label: "Omzet Hari Ini", val: `Rp ${(todayRevenue / 1000).toFixed(0)}K`, color: "text-blue-700" },
                { label: "Total Transaksi", val: totalTransactions.toString(), color: "text-gray-900" },
                { label: "AOV", val: `Rp ${(aov / 1000).toFixed(0)}K`, color: "text-gray-900" },
                { label: "Distributable Cash", val: `Rp ${(distributableCash / 1e6).toFixed(1)}Jt`, color: "text-green-600" },
                { label: "Bagian Investor", val: `Rp ${(investorShare / 1e6).toFixed(1)}Jt`, color: "text-blue-600" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase">{item.label}</p>
                  <p className={cn("text-base font-bold", item.color)}>{item.val}</p>
                </div>
              ))}
            </div>

            {/* Weekly bar chart from real POS data */}
            <div className="h-40 w-full bg-gray-50 rounded-xl border border-gray-100 flex items-end px-4 py-4 gap-2 relative">
              <div className="absolute top-4 left-4 text-xs font-medium text-gray-400">
                Omzet 7 hari terakhir (dari POS)
              </div>
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-400 hover:bg-blue-500 transition-colors rounded-t-sm relative group"
                    style={{ height: `${maxDaily > 0 ? (d.total / maxDaily) * 80 : 4}%`, minHeight: "4px" }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-1.5 rounded font-medium transition-opacity whitespace-nowrap z-10">
                      Rp {(d.total / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent transactions */}
          {outlet.posTransactions.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-gray-400" /> Transaksi POS Terbaru
              </h2>
              <div className="space-y-2">
                {outlet.posTransactions.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.timestamp).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    <span className="font-semibold text-gray-900">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {/* Revenue Sharing */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-gray-400" /> Revenue sharing
            </h2>
            <div className="space-y-3 mb-4">
              {[
                { label: `Investor (${shares.investor}%)`, val: investorShare, color: "bg-blue-100 text-blue-800 border-blue-100" },
                { label: `Brand (${shares.brand}%)`, val: distributableCash * (shares.brand / 100), color: "bg-green-100 text-green-800 border-green-100" },
                { label: `Operator (${shares.operator}%)`, val: distributableCash * (shares.operator / 100), color: "bg-orange-100 text-orange-800 border-orange-100" },
              ].map((s) => (
                <div key={s.label} className={cn("flex justify-between items-center p-3 rounded-xl border", s.color)}>
                  <span className="text-xs font-semibold uppercase">{s.label}</span>
                  <span className="font-bold text-sm">Rp {(s.val / 1e6).toFixed(2)}Jt</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Estimasi dari omzet bulan ini via waterfall POS.</p>
          </section>

          {/* Operator */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> Operator
            </h2>
            {outlet.operator ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                    {(outlet.operator.name || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{outlet.operator.name || "Operator"}</p>
                    <p className="text-xs text-gray-500">{outlet.operator.email}</p>
                  </div>
                </div>
                {outlet.operator.walletAddress && (
                  <a
                    href={getStellarExpertUrl(outlet.operator.walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {outlet.operator.walletAddress.slice(0, 10)}…
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada operator ditugaskan.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
