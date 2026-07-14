"use client";

import { User, Bell, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola preferensi akun admin dan notifikasi platform.</p>
      </div>

      <div className="space-y-6">
        {/* Profil */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Profil admin</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
                SA
              </div>
              <button className="text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                Ubah foto
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Nama lengkap</label>
                <input type="text" defaultValue="Super Admin" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Email</label>
                <input type="email" defaultValue="admin@nusaartha.id" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400" />
              </div>
            </div>
            <div className="pt-2">
              <button className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                Simpan perubahan
              </button>
            </div>
          </div>
        </section>

        {/* Notifikasi */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Notifikasi email</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { title: "Pengajuan brand baru", desc: "Terima email saat ada brand baru yang mendaftar.", active: true },
              { title: "Campaign outlet baru", desc: "Terima email saat ada campaign yang menunggu review.", active: true },
              { title: "Laporan monitoring outlet", desc: "Terima ringkasan performa outlet setiap minggu.", active: false },
              { title: "Peringatan sistem", desc: "Peringatan kritis jika ada anomali pada platform.", active: true },
            ].map((notif, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notif.active ? "bg-green-500" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notif.active ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keamanan */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Keamanan akun</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Password saat ini</label>
              <input type="password" placeholder="••••••••" className="w-full max-w-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Password baru</label>
              <input type="password" placeholder="••••••••" className="w-full max-w-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div className="pt-2">
              <button className="text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                Ubah password
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
