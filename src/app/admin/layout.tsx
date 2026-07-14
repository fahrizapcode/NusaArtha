"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Megaphone,
  Store,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const MENUS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Verifikasi brand", icon: ShieldCheck, href: "/admin/brands" },
  { label: "Campaign outlet", icon: Megaphone, href: "/admin/campaigns" },
  { label: "Monitoring outlet", icon: Store, href: "/admin/outlets" },
  { label: "Operator", icon: Users, href: "/admin/operators" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Pengaturan", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex-col hidden md:flex fixed inset-y-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-gray-100 justify-between">
          <div className="w-32 h-7 relative">
            <Image src="/logo.svg" alt="NusaArtha" fill className="object-contain object-left" />
          </div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded border border-gray-100">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
          {MENUS.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive(menu.href)
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <menu.icon className={cn("w-4 h-4", isActive(menu.href) ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
              {menu.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
            <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">Super Admin</p>
              <p className="text-xs text-gray-400 truncate">admin@nusaartha.id</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors group">
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:pl-60">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
          <p className="text-sm font-semibold text-gray-900">
            {MENUS.find((m) => isActive(m.href))?.label ?? "Admin"}
          </p>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
