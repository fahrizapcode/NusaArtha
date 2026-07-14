"use client";

import { User, Bell, Lock } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsPageComponent({ 
  userType = "Pengguna" 
}: { 
  userType?: string 
}) {
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  
  // Notification states
  const [notifs, setNotifs] = useState([
    { id: 1, title: "Promosi & Update", desc: "Terima info fitur baru dan promosi.", active: true },
    { id: 2, title: "Aktivitas Akun", desc: "Terima email untuk setiap login baru.", active: true },
    { id: 3, title: "Laporan Mingguan", desc: "Terima ringkasan aktivitas akun Anda.", active: false },
    { id: 4, title: "Peringatan Sistem", desc: "Peringatan kritis jika ada anomali.", active: true },
  ]);

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({ name: data.user.name, email: data.user.email });
        }
      })
      .catch(() => {});
  }, []);

  const toggleNotif = (id: number) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, active: !n.active } : n));
  };

  const handleUpdateProfile = () => {
    alert("Profil berhasil diperbarui!");
  };

  const handleUpdatePassword = () => {
    if (!oldPassword || !newPassword) {
      alert("Harap isi password saat ini dan password baru.");
      return;
    }
    alert("Password berhasil diubah!");
    setOldPassword("");
    setNewPassword("");
  };

  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() 
    : "NA";

  return (
    <div className="max-w-[800px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola preferensi akun dan keamanan Anda.</p>
      </div>

      <div className="space-y-6">
        {/* Profil */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Profil {userType}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <button className="text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                Ubah foto
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Nama lengkap</label>
                <input 
                  type="text" 
                  value={user?.name || ""} 
                  onChange={(e) => setUser(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Email</label>
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none cursor-not-allowed" 
                />
              </div>
            </div>
            <div className="pt-2">
              <button onClick={handleUpdateProfile} className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Simpan perubahan
              </button>
            </div>
          </div>
        </section>

        {/* Notifikasi */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Notifikasi Email</h2>
          </div>
          <div className="p-6 space-y-4">
            {notifs.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.desc}</p>
                </div>
                <div 
                  onClick={() => toggleNotif(notif.id)}
                  className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notif.active ? "bg-green-500" : "bg-gray-200"}`}
                >
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
            <h2 className="font-bold text-gray-900">Keamanan Akun</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Password saat ini</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full max-w-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Password baru</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full max-w-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors" 
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={handleUpdatePassword}
                className="text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                Ubah password
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
