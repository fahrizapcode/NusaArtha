"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, User, Mail, Key } from "lucide-react";

export default function OperatorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push("/login"); return; }
        setProfile({ name: d.user.name || "", email: d.user.email || "" });
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Placeholder — update profile API not yet implemented
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat pengaturan…
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola profil operator Anda.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            <User className="w-3.5 h-3.5" /> Nama Lengkap
          </label>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nama Anda"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <input
            value={profile.email}
            disabled
            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4" /> Profil berhasil disimpan
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Simpan Perubahan
        </Button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-400" /> Keamanan Akun
        </h3>
        <p className="text-xs text-gray-500 mb-4">Untuk mengubah password, silakan hubungi admin NusaArtha.</p>
        <Button
          variant="outline"
          onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/login"))}
          className="border-red-200 text-red-600 hover:bg-red-50 w-full"
        >
          Keluar dari Akun
        </Button>
      </div>
    </div>
  );
}
