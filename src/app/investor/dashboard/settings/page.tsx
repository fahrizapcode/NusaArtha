"use client";

import { Button } from "@/components/ui/button";
import { User, Shield, Building2, Wallet, Bell, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const SETTING_MENUS = [
    { title: "Profil Pengguna", desc: "Ubah data pribadi, KTP, dan alamat", icon: User },
    { title: "Keamanan Akun", desc: "Ubah password, 2FA, dan riwayat login", icon: Shield },
    { title: "Rekening Bank", desc: "Atur rekening tujuan untuk pencairan dana", icon: Building2 },
    { title: "Wallet & Pembayaran", desc: "Kelola metode pembayaran dan e-wallet", icon: Wallet },
    { title: "Notifikasi", desc: "Atur preferensi email dan push notification", icon: Bell },
  ];

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola preferensi akun dan data verifikasi Anda.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="divide-y divide-gray-100">
          {SETTING_MENUS.map((menu, i) => (
            <button key={i} className="w-full flex items-center p-5 sm:p-6 hover:bg-gray-50 transition-colors group text-left">
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center shrink-0 transition-colors mr-4">
                <menu.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{menu.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{menu.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
          Tutup Akun
        </Button>
      </div>
    </div>
  );
}
