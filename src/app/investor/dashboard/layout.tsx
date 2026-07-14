"use client";

import { cn } from "@/lib/utils";
import {
  Store,
  Settings,
  Bell,
  Search,
  LogOut,
  LineChart,
  Briefcase,
  Vote,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useStellarWallet } from "@/lib/stellar/context";
import { WalletButton } from "@/components/ui/wallet-button";

const MENUS = [
  { label: "Marketplace", icon: Store, href: "/investor/dashboard/marketplace" },
  { label: "Portfolio", icon: Briefcase, href: "/investor/dashboard/portfolio" },
  { label: "Revenue sharing", icon: LineChart, href: "/investor/dashboard/revenue" },
  { label: "Governance", icon: Vote, href: "/investor/dashboard/governance" },
  { label: "Pengaturan", icon: Settings, href: "/investor/dashboard/settings" },
];

function WalletSection() {
  const router = useRouter();
  const { isConnected, publicKey, xlmBalance, connect, disconnect, isConnecting, isFreighterInstalled: installed } =
    useStellarWallet();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (isConnected && publicKey) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs ring-2 ring-white shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-mono text-gray-800 truncate">
                {publicKey.slice(0, 6)}…{publicKey.slice(-4)}
              </p>
              <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-[10px] text-gray-500">{xlmBalance.toFixed(2)} XLM · Freighter</p>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors group"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <WalletButton variant="outline" className="w-full justify-center" />
      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors group"
      >
        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
        Keluar
      </button>
    </div>
  );
}

export default function InvestorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isMenuActive = (href: string) => {
    if (href === "/investor/dashboard/marketplace") {
      return pathname.includes("/marketplace");
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex fixed inset-y-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            NusaArtha
          </Link>
          <span className="ml-2 text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Investor</span>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {MENUS.map((menu, idx) => {
            const active = isMenuActive(menu.href);
            return (
              <Link
                key={idx}
                href={menu.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                )}
                <menu.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <span className="flex-1">{menu.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <WalletSection />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen pb-16 md:pb-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <h1 className="text-base font-semibold text-gray-900 hidden sm:block">
            {MENUS.find(m => isMenuActive(m.href))?.label || "Dashboard"}
          </h1>

          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari campaign..."
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-56 transition-all"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            
            <div className="h-5 w-px bg-gray-200 block md:hidden" />
            
            <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs md:hidden">
              JD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-40 pb-safe">
        {MENUS.map((menu, idx) => {
          const active = isMenuActive(menu.href);
          return (
            <Link
              key={idx}
              href={menu.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1",
                active ? "text-blue-600" : "text-gray-400"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                active ? "bg-blue-50" : "bg-transparent"
              )}>
                <menu.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium leading-none truncate w-full text-center">{menu.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
