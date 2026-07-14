"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  CircleDashed,
  Store,
  ShieldCheck,
  TrendingUp,
  LineChart,
  Users,
  AlertCircle,
  PackagePlus,
  Building2,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STAT_CARDS_APPROVED = [
  { label: "Total Paket Outlet", value: "3", icon: PackagePlus, color: "text-blue-600 bg-blue-50" },
  { label: "Paket Aktif", value: "2", icon: Building2, color: "text-green-600 bg-green-50" },
  { label: "Total Outlet Aktif", value: "5", icon: Store, color: "text-purple-600 bg-purple-50" },
  { label: "Outlet Baru (Bulan Ini)", value: "1", icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
];

const ONBOARDING_FEATURES = [
  { title: "Profil Brand", status: "Belum Lengkap", desc: "Lengkapi informasi brand, legalitas, produk, dan identitas usaha.", icon: Store },
  { title: "Brand Readiness", status: "Belum Tersedia", desc: "Evaluasi kesiapan bisnis untuk dikembangkan menjadi franchise.", icon: ShieldCheck },
  { title: "Outlet", status: "Belum Ada Outlet", desc: "Kelola seluruh outlet beserta performanya.", icon: Store },
  { title: "Franchise", status: "Belum Tersedia", desc: "Kelola paket kemitraan dan ekspansi franchise.", icon: TrendingUp },
  { title: "Investor", status: "Belum Tersedia", desc: "Setelah brand memenuhi persyaratan, Anda dapat membuka peluang pendanaan.", icon: Users },
  { title: "Analytics", status: "Belum Ada Data", desc: "Statistik bisnis akan muncul setelah aktivitas mulai berjalan.", icon: LineChart },
];

const ONBOARDING_TASKS = [
  { label: "Brand berhasil didaftarkan", done: true },
  { label: "Lengkapi Profil Brand", done: false },
  { label: "Upload Dokumen Pendukung", done: false },
  { label: "Verifikasi Brand", done: false },
  { label: "Brand Readiness Assessment", done: false },
  { label: "Publikasikan Brand", done: false },
];

// ─── Approved Dashboard ────────────────────────────────────────────────────────

function ApprovedDashboard({ router }: { router: any }) {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Welcome Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-green-100 to-blue-50 rounded-full opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang 👋</h2>
            <p className="text-gray-500 max-w-2xl leading-relaxed text-sm sm:text-base">
              Brand Anda telah berhasil melewati proses Brand Readiness, Due Diligence, dan Verifikasi Platform. Kini Anda dapat mulai membuat paket outlet untuk membuka peluang pendanaan dari investor.
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 px-6 flex-shrink-0 shadow-md shadow-blue-600/15"
          >
            <PackagePlus className="w-4 h-4" />
            Buat Paket Outlet
          </Button>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS_APPROVED.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-4", card.color)}>
              <card.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Paket Outlet Empty State */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Paket Outlet</h3>
          <Button
            onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-gray-200"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            Buat Paket
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          {/* Simple SVG Illustration */}
          <svg width="100" height="80" viewBox="0 0 100 80" fill="none" className="mb-6 opacity-40">
            <rect x="10" y="30" width="80" height="45" rx="8" fill="#E5E7EB" />
            <rect x="20" y="20" width="60" height="15" rx="6" fill="#D1D5DB" />
            <rect x="35" y="10" width="30" height="12" rx="5" fill="#9CA3AF" />
            <rect x="30" y="42" width="40" height="6" rx="3" fill="#9CA3AF" />
            <rect x="30" y="54" width="28" height="5" rx="2.5" fill="#D1D5DB" />
          </svg>
          <h4 className="text-base font-semibold text-gray-900 mb-2">Belum Ada Paket Outlet</h4>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
            Mulailah membuat paket outlet pertama untuk mendapatkan pendanaan dari investor.
          </p>
          <Button
            onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2"
          >
            <PackagePlus className="w-4 h-4" />
            Buat Paket Outlet
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/dashboard/outlet?status=approved")}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Kelola Outlet</p>
              <p className="text-xs text-gray-500 mt-0.5">Lihat dan kelola seluruh outlet</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button
          onClick={() => router.push("/dashboard/paket-outlet?status=approved")}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-gray-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Paket Outlet</p>
              <p className="text-xs text-gray-500 mt-0.5">Kelola paket & kisaran modal</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding Dashboard ─────────────────────────────────────────────────────

function OnboardingDashboard({ status, router }: { status: string | null; router: any }) {
  const isPending = status === "pending";

  const completedTasks = isPending ? 3 : 1;
  const progressPercent = Math.round((completedTasks / ONBOARDING_TASKS.length) * 100);

  const tasks = ONBOARDING_TASKS.map((t, i) => ({
    ...t,
    done: isPending ? i <= 2 : i === 0,
  }));

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col xl:flex-row gap-6">
      <div className="flex-1 space-y-6">
        {isPending && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold text-sm">Sedang Direview Platform</p>
              <p className="text-sm mt-0.5 text-amber-700/90">Profil Anda sedang diverifikasi tim. Estimasi proses: 2–5 Hari Kerja.</p>
            </div>
          </div>
        )}

        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang di Dashboard Brand 👋</h2>
            <p className="text-gray-500 max-w-2xl leading-relaxed mb-6 text-sm sm:text-base">
              Brand Anda berhasil didaftarkan. Lengkapi data brand Anda untuk membuka seluruh fitur platform.
            </p>
            {!isPending && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Brand Berhasil Didaftarkan</h3>
                  <p className="text-sm text-gray-600 mb-4">Lengkapi profil dan persyaratan brand untuk melanjutkan ke tahap berikutnya.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => router.push("/profile/complete")} className="bg-green-600 hover:bg-green-700 text-white px-5">
                      Lengkapi Profil Brand
                    </Button>
                    <Button variant="outline" className="text-gray-700 border-gray-300">Lihat Panduan</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ONBOARDING_FEATURES.map((feat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4 opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                <feat.icon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-gray-900 text-sm">{feat.title}</h3>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">{feat.status}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Onboarding Checklist</h3>
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">Progress</span>
              <span className="text-green-600">{progressPercent}% Selesai</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="space-y-3.5">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3">
                {task.done ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <span className={cn("text-sm font-medium", task.done ? "text-gray-900" : "text-gray-400")}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const isApproved = status === "approved";

  return isApproved ? (
    <ApprovedDashboard router={router} />
  ) : (
    <OnboardingDashboard status={status} router={router} />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
