"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Loader2, Store, MapPin, TrendingUp,
  Award, AlertCircle, CheckCircle2, User, Banknote,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Outlet = {
  id: string;
  name: string;
  location: string;
  status: string;
  pool: { name: string; brand: { name: string } };
  monthlyRevenue: number;
  txCount: number;
  performanceScore: {
    score: number;
    grade: string;
    status: string;
    notes: string[];
    eligibleForOwnership: boolean;
  };
};

type OperatorDetail = {
  id: string;
  name: string | null;
  email: string;
  walletAddress: string | null;
  createdAt: string;
  operatedOutlets: Outlet[];
};

const GRADE_STYLE: Record<string, string> = {
  A: "bg-green-50 text-green-700 border-green-200",
  B: "bg-blue-50 text-blue-700 border-blue-200",
  C: "bg-yellow-50 text-yellow-700 border-yellow-200",
  D: "bg-orange-50 text-orange-700 border-orange-200",
  F: "bg-red-50 text-red-700 border-red-200",
};

export default function OperatorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const operatorId = params.id as string;

  const [operator, setOperator] = useState<OperatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [allOutlets, setAllOutlets] = useState<{ id: string; name: string; poolId: string }[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!operatorId) return;
    Promise.all([
      fetch(`/api/operators/${operatorId}`).then((r) => r.json()),
      fetch("/api/outlets").then((r) => r.json()),
    ])
      .then(([operatorData, outletData]) => {
        setOperator(operatorData.operator);
        setAllOutlets(
          (outletData.outlets || []).filter((o: any) => !o.operatorId)
        );
      })
      .finally(() => setLoading(false));
  }, [operatorId]);

  const handleAssign = async () => {
    if (!selectedOutlet) return;
    setAssigning(true);
    setMessage("");
    try {
      const res = await fetch(`/api/operators/${operatorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId: selectedOutlet }),
      });
      if (res.ok) {
        setMessage("Operator berhasil ditugaskan ke outlet.");
        // Refresh
        const updated = await fetch(`/api/operators/${operatorId}`).then((r) => r.json());
        setOperator(updated.operator);
        const outletUpdated = await fetch("/api/outlets").then((r) => r.json());
        setAllOutlets((outletUpdated.outlets || []).filter((o: any) => !o.operatorId));
        setSelectedOutlet("");
      }
    } finally {
      setAssigning(false);
    }
  };

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

  const avgScore =
    operator.operatedOutlets.length > 0
      ? Math.round(
          operator.operatedOutlets.reduce((s, o) => s + (o.performanceScore?.score || 0), 0) /
          operator.operatedOutlets.length
        )
      : null;

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke daftar operator
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-14 h-14 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0">
          {(operator.name || operator.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{operator.name || "—"}</h1>
          <p className="text-sm text-gray-500">{operator.email}</p>
          {operator.walletAddress && (
            <p className="font-mono text-xs text-gray-400 truncate mt-0.5">{operator.walletAddress}</p>
          )}
        </div>
        {avgScore !== null && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500 mb-0.5">Avg. Score</p>
            <p className="text-2xl font-black text-gray-900">{avgScore}</p>
            <p className="text-xs text-gray-400">/ 100</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Outlet list with performance */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-400" /> Outlet yang Dikelola
            </h2>

            {operator.operatedOutlets.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Store className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Belum ada outlet yang ditugaskan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {operator.operatedOutlets.map((outlet) => (
                  <div key={outlet.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{outlet.name}</h3>
                        <p className="text-xs text-gray-500">
                          {outlet.pool.brand.name} · {outlet.pool.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3" /> {outlet.location}
                        </div>
                      </div>
                      {outlet.performanceScore && (
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0",
                          GRADE_STYLE[outlet.performanceScore.grade] || "bg-gray-100 text-gray-600 border-gray-200"
                        )}>
                          Grade {outlet.performanceScore.grade} · {outlet.performanceScore.score}/100
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Revenue bulanan</p>
                        <p className="text-sm font-bold text-gray-900">
                          Rp {(outlet.monthlyRevenue / 1e6).toFixed(1)}Jt
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Transaksi</p>
                        <p className="text-sm font-bold text-gray-900">{outlet.txCount}</p>
                      </div>
                    </div>
                    {outlet.performanceScore?.eligibleForOwnership && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-100">
                        <Award className="w-3.5 h-3.5" />
                        Eligible Operator-to-Ownership
                      </div>
                    )}
                    {outlet.performanceScore?.notes?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {outlet.performanceScore.notes.map((note, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Assign outlet */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Tugaskan Outlet
            </h3>

            {allOutlets.length === 0 ? (
              <p className="text-sm text-gray-400">Tidak ada outlet kosong tersedia.</p>
            ) : (
              <>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  <option value="">— Pilih outlet —</option>
                  {allOutlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedOutlet || assigning}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Tugaskan
                </Button>
              </>
            )}

            {message && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl p-2.5 border border-green-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> {message}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Info Operator</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total Outlet</span>
                  <span className="font-semibold">{operator.operatedOutlets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bergabung</span>
                  <span className="font-semibold">
                    {new Date(operator.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                  </span>
                </div>
                {avgScore !== null && (
                  <div className="flex justify-between">
                    <span>Avg. Performance</span>
                    <span className="font-semibold">{avgScore}/100</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
