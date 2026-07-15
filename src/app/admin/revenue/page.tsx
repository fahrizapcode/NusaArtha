"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Banknote, Loader2, CheckCircle2, AlertCircle, TrendingUp,
  Store, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type Pool = {
  id: string; name: string; location: string; status: string;
  brand: { name: string };
  investments: { tokensOwned: number }[];
  totalSupply: number; pricePerToken: number; revenueShares: string;
};

type DistributeForm = {
  grossRevenue: string; cogs: string; operatorCosts: string;
  rentAndUtilities: string; taxes: string; maintenanceCosts: string;
};

const DEFAULT_FORM: DistributeForm = {
  grossRevenue: "", cogs: "", operatorCosts: "",
  rentAndUtilities: "", taxes: "", maintenanceCosts: "",
};

export default function AdminRevenuePage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, DistributeForm>>({});
  const [distributing, setDistributing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; txHash?: string; msg: string; data?: any }>>({});

  useEffect(() => {
    fetch("/api/pools?status=OPERATING")
      .then((r) => r.json())
      .then((d) => setPools(d.pools || []))
      .finally(() => setLoading(false));
  }, []);

  const getForm = (poolId: string): DistributeForm => forms[poolId] || DEFAULT_FORM;
  const setField = (poolId: string, key: keyof DistributeForm, val: string) => {
    setForms((f) => ({ ...f, [poolId]: { ...getForm(poolId), [key]: val } }));
  };

  const handleDistribute = async (pool: Pool) => {
    const form = getForm(pool.id);
    if (!form.grossRevenue) return;
    setDistributing(pool.id);
    setResults((r) => ({ ...r, [pool.id]: { success: false, msg: "Memproses distribusi…" } }));

    try {
      const res = await fetch("/api/revenue/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          grossRevenue: Number(form.grossRevenue),
          cogs: Number(form.cogs || 0),
          operatorCosts: Number(form.operatorCosts || 0),
          rentAndUtilities: Number(form.rentAndUtilities || 0),
          taxes: Number(form.taxes || 0),
          maintenanceCosts: Number(form.maintenanceCosts || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults((r) => ({
        ...r,
        [pool.id]: {
          success: data.success,
          txHash: data.txHash,
          msg: data.success
            ? `Distribusi berhasil! Rp ${(data.distributableCash / 1e6).toFixed(2)}Jt didistribusikan ke ${data.distributions?.length || 0} investor.`
            : (data.message || data.error || "Gagal"),
          data,
        },
      }));
    } catch (err: any) {
      setResults((r) => ({ ...r, [pool.id]: { success: false, msg: err.message } }));
    } finally {
      setDistributing(null);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Distribusi Revenue Sharing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hitung dan distribusikan bagi hasil ke investor via Stellar untuk pool yang sedang OPERATING.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat pool beroperasi…
        </div>
      ) : pools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Store className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada pool berstatus OPERATING</p>
          <p className="text-xs text-gray-400 mt-1">Distribusi hanya tersedia untuk pool yang outlet-nya sudah beroperasi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pools.map((pool) => {
            const isOpen = expanded === pool.id;
            const form = getForm(pool.id);
            const result = results[pool.id];
            const isDistr = distributing === pool.id;
            const shares = (() => { try { return JSON.parse(pool.revenueShares); } catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; } })();
            const totalInvestors = new Set(pool.investments.map((_: any) => "x")).size;

            return (
              <div key={pool.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : pool.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {pool.brand.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{pool.name}</p>
                      <p className="text-xs text-gray-500">{pool.brand.name} · {pool.location} · {pool.investments.length} investment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">OPERATING</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Revenue shares summary */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { l: "Investor", p: shares.investor, c: "bg-blue-50 text-blue-700 border-blue-100" },
                        { l: "Brand", p: shares.brand, c: "bg-green-50 text-green-700 border-green-100" },
                        { l: "Operator", p: shares.operator, c: "bg-orange-50 text-orange-700 border-orange-100" },
                        { l: "Platform", p: shares.platform, c: "bg-gray-50 text-gray-600 border-gray-200" },
                      ].map((s) => (
                        <div key={s.l} className={cn("rounded-xl p-3 border text-center", s.c)}>
                          <p className="text-xs font-semibold uppercase">{s.l}</p>
                          <p className="text-lg font-bold">{s.p}%</p>
                        </div>
                      ))}
                    </div>

                    {/* Revenue input form */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Input Data POS Bulan Ini</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { key: "grossRevenue" as const, label: "Gross Revenue (Rp) *", required: true },
                          { key: "cogs" as const, label: "HPP / COGS (Rp)" },
                          { key: "operatorCosts" as const, label: "Biaya Operator (Rp)" },
                          { key: "rentAndUtilities" as const, label: "Sewa & Utilitas (Rp)" },
                          { key: "taxes" as const, label: "Pajak (Rp)" },
                          { key: "maintenanceCosts" as const, label: "Biaya Maintenance (Rp)" },
                        ].map(({ key, label, required }) => (
                          <div key={key}>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                            <input type="number" min={0} value={form[key]}
                              onChange={(e) => setField(pool.id, key, e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {result && (
                      <div className={cn("flex items-start gap-2 text-sm rounded-xl p-3 border",
                        result.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                        {result.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p>{result.msg}</p>
                          {result.txHash && (
                            <a href={getStellarExpertUrl(result.txHash, "tx")} target="_blank" rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 text-blue-700 hover:underline mt-1">
                              <ExternalLink className="w-3 h-3" /> TX: {result.txHash.slice(0, 16)}…
                            </a>
                          )}
                          {result.data?.distributions && result.data.distributions.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {result.data.distributions.slice(0, 3).map((d: any, i: number) => (
                                <p key={i} className="text-xs">{d.investorName}: {d.amountXLM} XLM</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button onClick={() => handleDistribute(pool)} disabled={isDistr || !form.grossRevenue}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2">
                      {isDistr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                      {isDistr ? "Mendistribusikan via Stellar…" : "Distribusikan Revenue Sharing"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
        <strong>Catatan:</strong> Distribusi dikirim langsung ke wallet Stellar setiap investor secara proporsional terhadap jumlah token yang dimiliki. Semua transaksi dicatat di blockchain dan IPFS sebagai audit trail.
      </div>
    </div>
  );
}
