"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PackagePlus, MapPin, ChevronRight, Search, Loader2,
  Building2, Banknote, TrendingUp, X, AlertCircle,
} from "lucide-react";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  DRAFT: { label: "Menunggu Review Admin", class: "bg-amber-50 text-amber-700 border border-amber-200" },
  PUBLISHED: { label: "Aktif di Marketplace", class: "bg-green-50 text-green-700 border border-green-200" },
  ACTIVE: { label: "Aktif", class: "bg-blue-50 text-blue-700 border border-blue-200" },
  OPERATING: { label: "Beroperasi", class: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  COMPLETED: { label: "Selesai", class: "bg-gray-100 text-gray-500" },
};

type Pool = {
  id: string;
  name: string;
  location: string;
  status: string;
  targetFunding: number;
  totalSupply: number;
  pricePerToken: number;
  collected: number;
  progress: number;
  investors: number;
  outlets: number;
};

function PaketOutletContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const isApproved = status === "approved";

  const [pools, setPools] = useState<Pool[]>([]);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", location: "", targetFunding: "", totalSupply: "", pricePerToken: "",
    investorShare: "40", brandShare: "30", operatorShare: "20", platformShare: "10",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const me = await meRes.json();

      const res = await fetch(`/api/dashboard/brand?ownerId=${me.user.id}`);
      const data = await res.json();
      if (data.brand) setBrandId(data.brand.id);
      setPools(data.pools || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = pools.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) { setFormError("Brand tidak ditemukan."); return; }

    const shares = {
      investor: parseInt(form.investorShare),
      brand: parseInt(form.brandShare),
      operator: parseInt(form.operatorShare),
      platform: parseInt(form.platformShare),
    };
    const total = Object.values(shares).reduce((a, b) => a + b, 0);
    if (total !== 100) { setFormError(`Total revenue share harus 100%, sekarang ${total}%.`); return; }
    if (!form.name || !form.location || !form.targetFunding || !form.totalSupply || !form.pricePerToken) {
      setFormError("Semua field wajib diisi."); return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          name: form.name,
          location: form.location,
          targetFunding: parseFloat(form.targetFunding),
          totalSupply: parseInt(form.totalSupply),
          pricePerToken: parseFloat(form.pricePerToken),
          revenueShares: shares,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat paket");

      setShowForm(false);
      setForm({ name: "", location: "", targetFunding: "", totalSupply: "", pricePerToken: "", investorShare: "40", brandShare: "30", operatorShare: "20", platformShare: "10" });
      await load(); // Reload pools
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat paket outlet…
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="max-w-[800px] mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 mb-1">Brand belum disetujui</p>
            <p className="text-sm text-amber-700">
              Fitur Paket Outlet hanya tersedia setelah brand Anda diverifikasi dan disetujui oleh tim NusaArtha.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Paket Outlet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola paket outlet yang akan ditawarkan kepada investor.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-sm shadow-blue-600/15 flex-shrink-0"
        >
          <PackagePlus className="w-4 h-4" />
          Buat Paket Baru
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cari nama atau lokasi..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
          />
        </div>
        <span className="ml-auto text-xs text-gray-500 font-medium">{pools.length} paket</span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 px-8 text-center">
          <PackagePlus className="w-12 h-12 text-gray-200 mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Belum Ada Paket Outlet</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
            Buat paket outlet untuk memulai campaign pendanaan dengan investor.
          </p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <PackagePlus className="w-4 h-4" /> Buat Paket Outlet
          </Button>
        </div>
      )}

      {/* Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pool) => {
            const cfg = STATUS_CONFIG[pool.status] || { label: pool.status, class: "bg-gray-100 text-gray-600" };
            return (
              <div key={pool.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900">{pool.name}</h3>
                      <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", cfg.class)}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {pool.location}
                    </p>
                  </div>
                </div>

                {/* Capital info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Target Pendanaan</p>
                  <p className="text-lg font-bold text-blue-800">
                    Rp {(pool.targetFunding / 1e6).toFixed(1)}Jt
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Terkumpul</span>
                    <span className="font-bold text-gray-900">{pool.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", pool.progress >= 100 ? "bg-green-500" : "bg-blue-500")}
                      style={{ width: `${Math.max(2, pool.progress)}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                    <span><span className="font-semibold text-gray-700">{pool.investors}</span> investor</span>
                    <span><span className="font-semibold text-gray-700">{pool.outlets}</span> outlet</span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-5">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <Banknote className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800">Rp {(pool.pricePerToken / 1e3).toFixed(0)}K</p>
                    <p className="text-gray-500 mt-0.5">/ Token</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800">{pool.totalSupply}</p>
                    <p className="text-gray-500 mt-0.5">Token</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                    <p className="font-semibold text-gray-800">{pool.outlets}</p>
                    <p className="text-gray-500 mt-0.5">Outlet</p>
                  </div>
                </div>

                {/* Actions */}
                <Link href={`/dashboard/paket-outlet/${pool.id}?status=${status}`}>
                  <Button size="sm" className="w-full h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}

          {/* Add New Card */}
          <button
            onClick={() => setShowForm(true)}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all group min-h-[280px]"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <PackagePlus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="font-semibold text-gray-600 group-hover:text-blue-700 text-sm transition-colors">
              Tambah Paket Baru
            </p>
            <p className="text-xs text-gray-400 mt-1">Klik untuk membuat paket outlet</p>
          </button>
        </div>
      )}

      {/* ─── Modal: Buat Paket Baru ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
              onClick={() => setShowForm(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Buat Paket Outlet Baru</h2>
                  <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                  <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    Paket baru akan berstatus <strong>DRAFT</strong> dan perlu disetujui admin sebelum tampil di marketplace investor.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Nama Outlet / Campaign *
                      </label>
                      <input
                        required value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Contoh: Kopi Nusantara - BSD City"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Lokasi Outlet *
                      </label>
                      <input
                        required value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="Contoh: Jl. Pahlawan No. 12, BSD City"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Target Dana (Rp) *
                        </label>
                        <input
                          required type="number" min="1000000" value={form.targetFunding}
                          onChange={(e) => setForm((f) => ({ ...f, targetFunding: e.target.value }))}
                          placeholder="500000000"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Total Token *
                        </label>
                        <input
                          required type="number" min="1" value={form.totalSupply}
                          onChange={(e) => setForm((f) => ({ ...f, totalSupply: e.target.value }))}
                          placeholder="1000"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Harga/Token (Rp) *
                        </label>
                        <input
                          required type="number" min="1000" value={form.pricePerToken}
                          onChange={(e) => setForm((f) => ({ ...f, pricePerToken: e.target.value }))}
                          placeholder="500000"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Revenue Share */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Revenue Share (Total harus 100%)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: "investorShare", label: "Investor" },
                          { key: "brandShare", label: "Brand" },
                          { key: "operatorShare", label: "Operator" },
                          { key: "platformShare", label: "Platform" },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-[10px] text-gray-500 block mb-1">{f.label} (%)</label>
                            <input
                              type="number" min="0" max="100"
                              value={(form as any)[f.key]}
                              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                              className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Total: {
                          [form.investorShare, form.brandShare, form.operatorShare, form.platformShare]
                            .map(Number)
                            .reduce((a, b) => a + b, 0)
                        }%
                      </p>
                    </div>
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {formError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 border-gray-200">
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !brandId}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Paket"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaketOutletPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 p-8 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>}>
      <PaketOutletContent />
    </Suspense>
  );
}
