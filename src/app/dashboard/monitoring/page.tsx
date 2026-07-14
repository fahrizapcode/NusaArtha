"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Package,
  Banknote,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const SUMMARY_CARDS = [
  { label: "Total Paket Aktif", value: "3", icon: Package, color: "text-blue-600 bg-blue-50" },
  { label: "Dana Sedang Dipooling", value: "Rp 175 Jt", icon: Banknote, color: "text-purple-600 bg-purple-50" },
  { label: "Target Pendanaan", value: "Rp 800 Jt", icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
  { label: "Persentase Pendanaan", value: "21%", icon: Activity, color: "text-green-600 bg-green-50" },
];

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  pooling: { label: "Pooling Berlangsung", class: "bg-purple-50 text-purple-700 border border-purple-200" },
  review: { label: "Menunggu Review", class: "bg-amber-50 text-amber-700 border border-amber-200" },
  building: { label: "Outlet Dibangun", class: "bg-orange-50 text-orange-700 border border-orange-200" },
};

const POOLING_PACKAGES = [
  {
    id: 1,
    name: "Paket Outlet BSD City",
    location: "Tangerang Selatan, Banten",
    target: "Rp 250.000.000",
    collected: "Rp 175.000.000",
    progress: 70,
    investors: 12,
    daysLeft: 18,
    status: "pooling",
  },
  {
    id: 2,
    name: "Paket Outlet Cihampelas",
    location: "Bandung, Jawa Barat",
    target: "Rp 200.000.000",
    collected: "Rp 200.000.000",
    progress: 100,
    investors: 9,
    daysLeft: 0,
    status: "building",
  },
  {
    id: 3,
    name: "Paket Outlet Sudirman",
    location: "Jakarta Pusat, DKI Jakarta",
    target: "Rp 350.000.000",
    collected: "Rp 0",
    progress: 0,
    investors: 0,
    daysLeft: 30,
    status: "review",
  },
];

function MonitoringContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Monitoring Pooling</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau seluruh proses pendanaan outlet secara real-time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Package Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Semua Paket ({POOLING_PACKAGES.length})</h2>
        </div>
        {POOLING_PACKAGES.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", STATUS_CONFIG[pkg.status]?.class)}>
                    {STATUS_CONFIG[pkg.status]?.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {pkg.location}
                </div>
              </div>
              <Button
                onClick={() => router.push(`/dashboard/monitoring/detail?status=${status}&id=${pkg.id}`)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-700 flex-shrink-0 h-8 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Lihat Detail
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-gray-900">{pkg.collected}</span>
                  <span className="text-xs text-gray-500 ml-2">dari {pkg.target}</span>
                </div>
                <span className={cn("text-sm font-bold", pkg.progress === 100 ? "text-green-600" : "text-blue-600")}>
                  {pkg.progress}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", pkg.progress === 100 ? "bg-green-500" : "bg-blue-500")}
                  style={{ width: `${pkg.progress}%` }}
                />
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                <span><span className="font-semibold text-gray-700">{pkg.investors}</span> Investor</span>
              </div>
              {pkg.daysLeft > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Sisa <span className="font-semibold text-gray-700">{pkg.daysLeft}</span> hari</span>
                </div>
              )}
              {pkg.daysLeft === 0 && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Pendanaan selesai</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8">Loading...</div>}>
      <MonitoringContent />
    </Suspense>
  );
}
