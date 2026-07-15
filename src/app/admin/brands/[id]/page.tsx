"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, ShieldCheck, FileText, TrendingUp,
  Loader2, ExternalLink, AlertCircle, ClipboardCheck, Plus,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getIPFSGatewayUrl } from "@/lib/ipfs";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type BrandDetail = {
  id: string; name: string; businessType: string; riskLevel: string;
  readinessScore: number | null; legalDocsCID: string | null; sopDocsCID: string | null;
  createdAt: string;
  owner: { id: string; name: string | null; email: string; walletAddress: string | null };
  pools: { id: string; status: string }[];
};

const RISK_OPTIONS = ["PENDING", "EMERGING", "MEZZANINE", "MATURE", "HIGH_RISK"];
const RISK_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600", EMERGING: "bg-yellow-50 text-yellow-700",
  MEZZANINE: "bg-blue-50 text-blue-700", MATURE: "bg-green-50 text-green-700",
  HIGH_RISK: "bg-red-50 text-red-700",
};

type DDForm = {
  legalityValid: boolean; financialValid: boolean; sopValid: boolean;
  projectionRealistic: boolean; locationFeasible: boolean; supplyChainReady: boolean;
  riskLevel: string; readinessScore: number; notes: string;
};

const DEFAULT_DD: DDForm = {
  legalityValid: false, financialValid: false, sopValid: false,
  projectionRealistic: false, locationFeasible: false, supplyChainReady: false,
  riskLevel: "MEZZANINE", readinessScore: 70, notes: "",
};

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [riskLevel, setRiskLevel] = useState("PENDING");
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [ddForm, setDDForm] = useState<DDForm>(DEFAULT_DD);
  const [ddSaving, setDDSaving] = useState(false);
  const [ddSaved, setDDSaved] = useState(false);
  const [ddDecision, setDDDecision] = useState<"" | "APPROVED" | "REVISION" | "REJECTED">("");
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [poolForm, setPoolForm] = useState({
    name: "", location: "", targetFunding: "", totalSupply: "1000", pricePerToken: "",
    investorShare: "40", brandShare: "30", operatorShare: "20", platformShare: "10",
  });
  const [creatingPool, setCreatingPool] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);

  useEffect(() => {
    if (!brandId) return;
    fetch(`/api/brands/${brandId}`)
      .then((r) => r.json())
      .then((d) => {
        setBrand(d.brand);
        setRiskLevel(d.brand.riskLevel || "PENDING");
        setReadinessScore(d.brand.readinessScore || 0);
        setDDForm((f) => ({ ...f, riskLevel: d.brand.riskLevel || "MEZZANINE", readinessScore: d.brand.readinessScore || 70 }));
      })
      .finally(() => setLoading(false));
  }, [brandId]);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskLevel, readinessScore }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      const data = await res.json();
      setBrand((prev) => prev ? { ...prev, ...data.brand } : prev);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDueDiligence = async (decision: "APPROVED" | "REVISION" | "REJECTED") => {
    setDDSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/due-diligence", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ddForm, brandId, decision }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setBrand((p) => p ? { ...p, riskLevel: data.brand.riskLevel, readinessScore: data.brand.readinessScore } : p);
      setRiskLevel(data.brand.riskLevel);
      setReadinessScore(data.brand.readinessScore || 0);
      setDDDecision(decision);
      setDDSaved(true); setTimeout(() => setDDSaved(false), 3000);
    } catch (e: any) { setError(e.message); } finally { setDDSaving(false); }
  };

  const handleCreatePool = async () => {
    setCreatingPool(true); setError("");
    try {
      const res = await fetch("/api/admin/pools", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, ...poolForm }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setPoolCreated(true); setShowCreatePool(false);
      const d = await fetch(`/api/brands/${brandId}`).then((r) => r.json());
      setBrand(d.brand);
    } catch (e: any) { setError(e.message); } finally { setCreatingPool(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Memuat data brand…
    </div>
  );

  if (!brand) return (
    <div className="text-center py-24">
      <p className="text-gray-500 mb-4">Brand tidak ditemukan.</p>
      <Button onClick={() => router.back()} variant="outline">Kembali</Button>
    </div>
  );

  const isApproved = !["PENDING", "HIGH_RISK"].includes(riskLevel);
  const isRejected = riskLevel === "HIGH_RISK";
  const ddCheckboxes = [
    { key: "legalityValid" as const, label: "Legalitas valid (NIB/NPWP terverifikasi)" },
    { key: "financialValid" as const, label: "Data keuangan/omzet sesuai fakta" },
    { key: "sopValid" as const, label: "SOP operasional lengkap dan realistis" },
    { key: "projectionRealistic" as const, label: "Proyeksi keuangan masuk akal" },
    { key: "locationFeasible" as const, label: "Lokasi outlet layak ekspansi" },
    { key: "supplyChainReady" as const, label: "Supply chain siap mendukung ekspansi" },
  ];

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali ke verifikasi brand
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">
            {brand.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
            <p className="text-sm text-gray-500">
              {brand.businessType} · {new Date(brand.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} oleh <span className="font-medium text-gray-700">{brand.owner.name || brand.owner.email}</span>
            </p>
          </div>
        </div>
        <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide", RISK_STYLES[riskLevel] || "bg-gray-100 text-gray-600")}>
          {riskLevel}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {/* Brand Info */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /> Informasi brand</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Nama brand</p><p className="font-medium text-gray-900">{brand.name}</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Kategori</p><p className="font-medium text-gray-900">{brand.businessType}</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Pemilik</p><p className="font-medium text-gray-900">{brand.owner.name || "—"}</p></div>
              <div><p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Email</p><p className="font-medium text-gray-900 truncate">{brand.owner.email}</p></div>
              {brand.owner.walletAddress && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Stellar Wallet</p>
                  <a href={getStellarExpertUrl(brand.owner.walletAddress)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-1">
                    {brand.owner.walletAddress.slice(0, 12)}…{brand.owner.walletAddress.slice(-8)} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Documents */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Dokumen legalitas</h2>
            <div className="space-y-3 text-sm">
              {brand.legalDocsCID ? (
                <a href={getIPFSGatewayUrl(brand.legalDocsCID)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-gray-700">Dokumen legalitas / Due Diligence (IPFS)</span></div>
                  <div className="flex items-center gap-2"><span className="font-mono text-xs text-gray-400">{brand.legalDocsCID.slice(0, 10)}…</span><ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" /></div>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-sm">
                  <AlertCircle className="w-4 h-4" /> Dokumen legalitas belum diunggah
                </div>
              )}
              {brand.sopDocsCID && (
                <a href={getIPFSGatewayUrl(brand.sopDocsCID)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-gray-700">SOP Operasional (IPFS)</span></div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                </a>
              )}
            </div>
          </section>

          {/* Due Diligence Section */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-gray-400" /> Due Diligence</h2>
            <div className="space-y-3 mb-5">
              {ddCheckboxes.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={ddForm[key]} onChange={(e) => setDDForm((f) => ({ ...f, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600" />
                  <span className={cn("text-sm", ddForm[key] ? "text-gray-900 font-medium" : "text-gray-500")}>{label}</span>
                  {ddForm[key] && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                </label>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Catatan Reviewer</label>
              <textarea value={ddForm.notes} onChange={(e) => setDDForm((f) => ({ ...f, notes: e.target.value }))} rows={3}
                placeholder="Tambahkan catatan due diligence yang akan disimpan di IPFS…"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            {ddSaved && (
              <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl p-2.5 border border-green-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> Due Diligence disimpan ({ddDecision}) — dicatat di IPFS!
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => handleDueDiligence("APPROVED")} disabled={ddSaving} className="bg-green-600 hover:bg-green-700 text-white text-xs h-9">
                {ddSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "✓ Lolos"}
              </Button>
              <Button onClick={() => handleDueDiligence("REVISION")} variant="outline" disabled={ddSaving} className="text-xs h-9 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                Revisi
              </Button>
              <Button onClick={() => handleDueDiligence("REJECTED")} variant="outline" disabled={ddSaving} className="text-xs h-9 border-red-200 text-red-600 hover:bg-red-50">
                ✗ Ditolak
              </Button>
            </div>
          </section>

          {/* Create Investment Pool */}
          {isApproved && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /> Investment Pools</h2>
                <Button size="sm" onClick={() => setShowCreatePool(!showCreatePool)} className="gap-1.5 text-xs h-8 bg-gray-900 hover:bg-gray-800 text-white">
                  <Plus className="w-3.5 h-3.5" /> Buat Pool Baru
                </Button>
              </div>
              {showCreatePool && (
                <div className="border border-gray-100 rounded-xl p-4 mb-4 space-y-3 bg-gray-50">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: "Nama Pool", key: "name", placeholder: "Kopi Nusantara - BSD City" },
                      { label: "Lokasi", key: "location", placeholder: "Jl. Pahlawan No. 12, BSD City" },
                      { label: "Target Dana (Rp)", key: "targetFunding", type: "number", placeholder: "500000000" },
                      { label: "Total Supply Token", key: "totalSupply", type: "number", placeholder: "1000" },
                      { label: "Harga per Token (Rp)", key: "pricePerToken", type: "number", placeholder: "500000" },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                        <input type={type || "text"} value={(poolForm as any)[key]} onChange={(e) => setPoolForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mt-2">Revenue Share (%)</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Investor", key: "investorShare" },
                      { label: "Brand", key: "brandShare" },
                      { label: "Operator", key: "operatorShare" },
                      { label: "Platform", key: "platformShare" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="text-[10px] font-semibold text-gray-500 block mb-1">{label}</label>
                        <input type="number" value={(poolForm as any)[key]} onChange={(e) => setPoolForm((f) => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleCreatePool} disabled={creatingPool || !poolForm.name || !poolForm.targetFunding}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-2">
                    {creatingPool ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Buat Investment Pool
                  </Button>
                </div>
              )}
              {poolCreated && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl p-2.5 border border-green-100 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pool berhasil dibuat!
                </div>
              )}
              {brand.pools.length > 0 && (
                <div className="space-y-2">
                  {brand.pools.map((pool) => (
                    <div key={pool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-mono text-xs text-gray-600">{pool.id.slice(0, 16)}…</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase", {
                        DRAFT: "bg-gray-100 text-gray-600", PUBLISHED: "bg-blue-50 text-blue-700",
                        ACTIVE: "bg-green-50 text-green-700", OPERATING: "bg-indigo-50 text-indigo-700",
                      }[pool.status] || "bg-gray-100 text-gray-600")}>
                        {pool.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-1">Brand Readiness Score</h3>
            <p className="text-xs text-gray-500 mb-4">Set skor dan level risiko brand</p>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-semibold text-gray-600">Skor Kesiapan</label>
                <span className="text-sm font-bold text-gray-900">{readinessScore}/100</span>
              </div>
              <input type="range" min={0} max={100} value={readinessScore}
                onChange={(e) => { setReadinessScore(parseInt(e.target.value)); setDDForm((f) => ({ ...f, readinessScore: parseInt(e.target.value) })); }}
                className="w-full h-2 rounded-full appearance-none bg-gray-100 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 cursor-pointer" />
              <div className="h-2 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-600 block mb-2">Level Risiko</label>
              <div className="grid grid-cols-2 gap-1.5">
                {RISK_OPTIONS.map((lvl) => (
                  <button key={lvl} onClick={() => { setRiskLevel(lvl); setDDForm((f) => ({ ...f, riskLevel: lvl })); }}
                    className={cn("px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors border",
                      riskLevel === lvl ? RISK_STYLES[lvl] + " border-current" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="mb-3 text-xs text-red-600 bg-red-50 rounded-xl p-2 border border-red-100">{error}</div>}
            {saved && <div className="mb-3 text-xs text-green-700 bg-green-50 rounded-xl p-2 border border-green-100 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan!</div>}
            <div className="space-y-2">
              {!isApproved && !isRejected && (
                <>
                  <Button onClick={() => { setRiskLevel("MATURE"); setReadinessScore(Math.max(readinessScore, 80)); setTimeout(handleSave, 100); }}
                    disabled={saving} className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Setujui brand
                  </Button>
                  <Button variant="outline" onClick={() => { setRiskLevel("HIGH_RISK"); setTimeout(handleSave, 100); }} disabled={saving}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50">Tolak brand</Button>
                </>
              )}
              <Button variant="outline" onClick={handleSave} disabled={saving} className="w-full border-gray-200 text-gray-700">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan perubahan
              </Button>
            </div>
            {isApproved && <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium text-center border border-green-200">✓ Brand disetujui ({riskLevel})</div>}
            {isRejected && <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-600 font-medium text-center border border-red-200">✗ Brand ditolak</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
