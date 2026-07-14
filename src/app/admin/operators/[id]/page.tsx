"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Store, Star, Award, BookOpen, TrendingUp,
  MapPin, Loader2, ExternalLink, Users, Wallet,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type OperatorDetail = {
  id: string;
  name: string | null;
  email: string;
  walletAddress: string | null;
  operatedOutlets: {
    id: string;
    name: string;
    location: string;
    status: string;
    pool: {
      name: string;
      brand: { name: string };
    };
    posTransactions: { amount: number; timestamp: string }[];
  }[];
};

export default function OperatorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const operatorId = params.id as string;

  const [operator, setOperator] = useState<OperatorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!operatorId) return;
    // Fetch from operators API (uses GET /api/outlets?operatorId=...)
    fetch(`/api/outlets?operatorId=${operatorId}`)
      .then((r) => r.json())
      .then(async (d) => {
        const outlets = d.outlets || [];
        // Get operator info from first outlet
        if (outlets.length > 0) {
          const op = outlets[0].operator;
          setOperator({
            id: op?.id || operatorId,
            name: op?.name || null,
            email: op?.email || "",
            walletAddress: op?.walletAddress || null,
            operatedOutlets: outlets,
          });
        } else {
          // Fallback: fetch user directly
          const userRes = await fetch(`/api/auth/wallet?walletAddress=${operatorId}`).catch(() => null);
          if (userRes?.ok) {
            const userData = await userRes.json();
            setOperator({
              id: operatorId,
              name: userData.user?.name || null,
              email: userData.user?.email || "",
              walletAddress: userData.user?.walletAddress || null,
              operatedOutlets: [],
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [operatorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data operator…
      </div>
    );
  }

  if (!operator) {
    return <div className="text-center py-24 text-gray-500">Operator tidak ditemukan.</div>;
  }

  // Compute total monthly revenue across all outlets
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalMonthlyRevenue = operator.operatedOutlets.reduce((total, outlet) => {
    const monthly = outlet.posTransactions
      .filter((tx) => new Date(tx.timestamp) >= firstOfMonth)
      .reduce((s, tx) => s + tx.amount, 0);
    return total + monthly;
  }, 0);

  const operatingOutlets = operator.operatedOutlets.filter(
    (o) => o.status === "OPERATING"
  ).length;

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke operator
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0">
            {(operator.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {operator.name || "Operator"}
            </h1>
            <p className="text-sm text-gray-500">{operator.email}</p>
            {operator.walletAddress && (
              <a
                href={getStellarExpertUrl(operator.walletAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                <Wallet className="w-3 h-3" />
                {operator.walletAddress.slice(0, 10)}…
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase">
            {operatingOutlets} Outlet Aktif
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-400" /> Ringkasan kinerja
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Outlet Dikelola", val: operator.operatedOutlets.length.toString() },
              { label: "Outlet Beroperasi", val: operatingOutlets.toString() },
              { label: "Omzet Bulan Ini", val: `Rp ${(totalMonthlyRevenue / 1e6).toFixed(1)}Jt` },
              { label: "Transaksi", val: operator.operatedOutlets.reduce((s, o) => s + o.posTransactions.length, 0).toString() },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase">{item.label}</p>
                <p className="font-bold text-gray-900 text-lg">{item.val}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "Kepatuhan SOP", val: 90 },
              { label: "Kualitas Pelayanan", val: 85 },
              { label: "Akurasi Laporan", val: 95 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{m.label}</span>
                  <span className="font-bold text-gray-900">{m.val}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", m.val >= 90 ? "bg-green-500" : "bg-blue-500")}
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Training History (static for MVP) */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" /> Riwayat pelatihan
          </h2>
          <div className="space-y-4 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-100" />
            {[
              { title: "Advanced Barista Training", date: "Jan 2026", status: "Lulus" },
              { title: "Customer Service Excellence", date: "Okt 2025", status: "Lulus" },
              { title: "Manajemen Inventori & Stok", date: "Jul 2025", status: "Lulus dengan pujian" },
              { title: "NusaArtha Operator Onboarding", date: "Ags 2024", status: "Lulus" },
            ].map((t, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center z-10 shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.date} ·{" "}
                    <span className="text-green-600 font-medium">{t.status}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outlets managed */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-400" /> Outlet yang dikelola ({operator.operatedOutlets.length})
          </h2>

          {operator.operatedOutlets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada outlet ditugaskan.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {operator.operatedOutlets.map((outlet) => {
                const monthly = outlet.posTransactions
                  .filter((tx) => new Date(tx.timestamp) >= firstOfMonth)
                  .reduce((s, tx) => s + tx.amount, 0);

                return (
                  <div
                    key={outlet.id}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{outlet.name}</h3>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {outlet.location}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">{outlet.pool.brand.name}</p>
                    <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">
                          Omzet bln ini
                        </p>
                        <p className="font-bold text-gray-900">
                          Rp {(monthly / 1e6).toFixed(1)}Jt
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded uppercase",
                          outlet.status === "OPERATING"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {outlet.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
