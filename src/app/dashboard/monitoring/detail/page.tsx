"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Clock,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const PACKAGE_DETAIL = {
  name: "Paket Outlet BSD City",
  location: "Tangerang Selatan, Banten",
  target: "Rp 250.000.000",
  collected: "Rp 175.000.000",
  progress: 70,
  investors: 12,
  status: "Pooling Berlangsung",
  publishedDate: "10 Juli 2026",
};

const TIMELINE = [
  { label: "Paket Dipublikasikan", done: true, desc: "10 Juli 2026" },
  { label: "Investor Mulai Berinvestasi", done: true, desc: "12 Juli 2026 · 12 investor" },
  { label: "Pooling Berlangsung", done: false, active: true, desc: "Sisa 18 hari pendanaan" },
  { label: "Target Pendanaan Tercapai", done: false, desc: "—" },
  { label: "Outlet Mulai Dibangun", done: false, desc: "—" },
  { label: "Outlet Beroperasi", done: false, desc: "—" },
];

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push(`/dashboard/monitoring?status=${status}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Monitoring
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Info & Progress */}
        <div className="flex-1 space-y-5">
          {/* Package Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{PACKAGE_DETAIL.name}</h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {PACKAGE_DETAIL.location}
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 self-start">
                {PACKAGE_DETAIL.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Target Dana</span>
                </div>
                <p className="text-base font-bold text-gray-900">{PACKAGE_DETAIL.target}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Terkumpul</span>
                </div>
                <p className="text-base font-bold text-blue-700">{PACKAGE_DETAIL.collected}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Total Investor</span>
                </div>
                <p className="text-base font-bold text-gray-900">{PACKAGE_DETAIL.investors} Investor</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Dipublikasikan</span>
                </div>
                <p className="text-base font-bold text-gray-900">{PACKAGE_DETAIL.publishedDate}</p>
              </div>
            </div>

            {/* Big Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">Progress Pendanaan</span>
                <span className="text-2xl font-bold text-blue-600">{PACKAGE_DETAIL.progress}%</span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: `${PACKAGE_DETAIL.progress}%` }}
                >
                  <span className="text-[10px] font-bold text-white">{PACKAGE_DETAIL.progress}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Rp 0</span>
                <span>{PACKAGE_DETAIL.target}</span>
              </div>
            </div>
          </div>

          {/* Investor Summary Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Daftar Investor</h2>
            <div className="space-y-3">
              {[
                { name: "Ahmad Fauzi", amount: "Rp 25.000.000", date: "12 Jul 2026" },
                { name: "Siti Rahma", amount: "Rp 15.000.000", date: "13 Jul 2026" },
                { name: "Budi Santoso", amount: "Rp 20.000.000", date: "14 Jul 2026" },
              ].map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {inv.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.name}</p>
                      <p className="text-xs text-gray-500">{inv.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{inv.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="md:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-6">Timeline Proses</h2>
            <div className="relative">
              {/* connecting line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-100" />
              <div className="space-y-6 relative z-10">
                {TIMELINE.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    {step.done ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 bg-white" />
                    ) : step.active ? (
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                    ) : (
                      <CircleDashed className="w-6 h-6 text-gray-300 flex-shrink-0 bg-white" />
                    )}
                    <div>
                      <p className={cn(
                        "text-sm font-semibold leading-snug",
                        step.done ? "text-gray-900" : step.active ? "text-blue-700" : "text-gray-400"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonitoringDetailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8">Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}
