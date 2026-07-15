"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp, Award, Star, Loader2, AlertCircle,
  CheckCircle2, Target, Banknote, Info, ArrowRight,
} from "lucide-react";

type ScoreResult = {
  score: number;
  grade: string;
  status: string;
  notes: string[];
  eligibleForOwnership: boolean;
};

type PerformanceData = {
  score: ScoreResult | null;
  message?: string;
  metrics: {
    totalRevenue: number;
    thisMonthRevenue: number;
    txCount: number;
    outletCount: number;
    monthlyIncentive: number;
    ownershipAccumulation: number;
  };
};

const GRADE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  A: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
  B: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  C: { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200" },
  D: { bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200" },
  F: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
};

export default function OperatorPerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operator/performance")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Menghitung performa Anda…
      </div>
    );
  }

  if (!data?.score) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-24">
        <Target className="w-14 h-14 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-700 mb-2">
          {data?.message || "Belum ada data performa"}
        </h2>
        <p className="text-sm text-gray-500">
          Performa akan dihitung setelah Anda mulai mengelola outlet dan mencatat transaksi POS.
        </p>
      </div>
    );
  }

  const { score, metrics } = data;
  const colors = GRADE_COLORS[score.grade] || GRADE_COLORS["C"];

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Performa Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Operator Performance Score bulan ini
        </p>
      </div>

      {/* Score card */}
      <div className={cn("rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 border", colors.bg, "border-current/10")}>
        {/* Circle score */}
        <div className="flex-shrink-0">
          <div className={cn(
            "w-32 h-32 rounded-full flex flex-col items-center justify-center ring-8 bg-white",
            colors.ring
          )}>
            <span className={cn("text-4xl font-black", colors.text)}>{score.score}</span>
            <span className={cn("text-xs font-bold uppercase tracking-wide", colors.text)}>/ 100</span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <Award className={cn("w-5 h-5", colors.text)} />
            <span className={cn("text-2xl font-black", colors.text)}>Grade {score.grade}</span>
          </div>
          <p className={cn("text-lg font-bold mb-1", colors.text)}>{score.status}</p>
          <p className="text-sm text-gray-500">
            {score.eligibleForOwnership
              ? "✓ Anda eligible untuk program Operator-to-Ownership"
              : "Tingkatkan performa untuk program Operator-to-Ownership"}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue Bulan Ini",
            value: `Rp ${(metrics.thisMonthRevenue / 1e6).toFixed(1)}Jt`,
            icon: TrendingUp,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Total Outlet",
            value: metrics.outletCount.toString(),
            icon: Target,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Total Transaksi",
            value: metrics.txCount.toString(),
            icon: Star,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Insentif Bulan Ini",
            value: `Rp ${(metrics.monthlyIncentive / 1e6).toFixed(2)}Jt`,
            icon: Banknote,
            color: "text-orange-600 bg-orange-50",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-lg font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Operator-to-Ownership */}
      {score.eligibleForOwnership && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">Program Operator-to-Ownership</h3>
              <p className="text-sm text-blue-700 mb-4">
                Karena performa Anda memenuhi syarat (Grade {score.grade}), sebagian insentif bulanan dapat
                dialokasikan sebagai akumulasi hak kepemilikan outlet secara bertahap.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Insentif Tunai</p>
                  <p className="text-xl font-bold text-blue-900">
                    Rp {((metrics.monthlyIncentive - metrics.ownershipAccumulation) / 1e6).toFixed(2)}Jt
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5">Diterima bulan ini</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Akumulasi Kepemilikan</p>
                  <p className="text-xl font-bold text-indigo-900">
                    Rp {(metrics.ownershipAccumulation / 1e6).toFixed(2)}Jt
                  </p>
                  <p className="text-xs text-indigo-500 mt-0.5">Dikonversi ke hak kepemilikan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Improvement */}
      {score.notes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" /> Catatan untuk Peningkatan
          </h3>
          <div className="space-y-2.5">
            {score.notes.map((note, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {score.notes.length === 0 && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Performa sangat baik! Tidak ada catatan perbaikan saat ini.
        </div>
      )}

      {/* Komponen scoring */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Komponen Penilaian</h3>
        <div className="space-y-3">
          {[
            { label: "Pencapaian Penjualan", pct: 30 },
            { label: "Kepatuhan SOP", pct: 25 },
            { label: "Akurasi Laporan Stok", pct: 15 },
            { label: "Volume Transaksi", pct: 20 },
            { label: "Ulasan Pelanggan", pct: 12 },
            { label: "Efisiensi Operasional", pct: 8 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-xs text-gray-400 font-medium">bobot {item.pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${item.pct * 3.33}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
