"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  PackagePlus,
  BadgeCheck,
  Building2,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

// ─── Base Menus ──────────────────────────────────────────────────────────────
const BASE_MENUS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Paket Outlet", icon: PackagePlus, href: "/dashboard/paket-outlet" },
  { label: "Outlet", icon: Building2, href: "/dashboard/outlet" },
  { label: "Pengaturan", icon: Settings, href: "/dashboard/settings" },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const isApproved = status === "approved";
  const isPending = status === "pending";

  const menus = BASE_MENUS.map((m) => ({
    ...m,
    disabled: m.label === "Dashboard" ? false : !isApproved,
    href: m.label === "Dashboard" 
      ? (status ? `/dashboard?status=${status}` : "/dashboard") 
      : (isApproved ? `${m.href}?status=approved` : "#"),
  }));

  const isMenuActive = (href: string) => {
    const hrefPath = href.split("?")[0];
    return pathname === hrefPath;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 hidden md:flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <img src="/logo.svg" alt="NusaArtha" className="h-6" />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2.5 flex flex-col gap-0.5">
          {menus.map((menu, i) => {
            const active = isMenuActive(menu.href);
            return (
              <Link
                key={i}
                href={menu.disabled ? "#" : menu.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  active
                    ? isApproved
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  menu.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <menu.icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    active
                      ? isApproved ? "text-blue-600" : "text-green-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <span className="flex-1">{menu.label}</span>
                {menu.disabled && (
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md leading-none">
                    Terkunci
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-gray-100">
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-60 min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <h1 className="text-base font-semibold text-gray-900 hidden sm:block capitalize">
            {pathname === "/dashboard" ? "Dashboard" :
             pathname.includes("paket-outlet") ? "Paket Outlet" :
             pathname.includes("monitoring") ? "Monitoring Pooling" :
             "Pengaturan"}
          </h1>

          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari..."
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56 transition-all"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <button className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full flex items-center justify-center text-xs ring-2 ring-white shadow-sm">
                KN
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">Kopi Nusantara</p>
                {isApproved ? (
                  <div className="flex items-center gap-1 mt-1">
                    <BadgeCheck className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-green-600 font-medium">Brand Terverifikasi</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {isPending ? "Sedang Direview" : "Brand Baru"}
                  </p>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
