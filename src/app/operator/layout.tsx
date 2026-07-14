"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Store, LineChart, Settings, Bell, LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const MENUS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/operator" },
  { label: "Outlet Saya", icon: Store, href: "/operator/outlet" },
  { label: "Transaksi POS", icon: LineChart, href: "/operator/pos" },
  { label: "Pengaturan", icon: Settings, href: "/operator/settings" },
];

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 hidden md:flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-5 border-b border-gray-100 gap-2">
          <img src="/logo.svg" alt="NusaArtha" className="h-6" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Operator</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2.5 flex flex-col gap-0.5">
          {MENUS.map((menu) => {
            const active = pathname === menu.href || (menu.href !== "/operator" && pathname.startsWith(menu.href));
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  active ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <menu.icon className={cn("w-[18px] h-[18px] flex-shrink-0", active ? "text-orange-600" : "text-gray-400 group-hover:text-gray-500")} />
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:pl-60 min-h-screen">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <h1 className="text-base font-semibold text-gray-900">
            {MENUS.find((m) => pathname === m.href || (m.href !== "/operator" && pathname.startsWith(m.href)))?.label || "Dashboard"}
          </h1>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
