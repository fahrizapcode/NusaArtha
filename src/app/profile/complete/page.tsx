"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  { id: 1, title: "Informasi Brand", desc: "Identitas dasar brand" },
  { id: 2, title: "Legalitas", desc: "NIB, NPWP, dan dokumen" },
  { id: 3, title: "Data Penjualan", desc: "Performa bisnis" },
  { id: 4, title: "Operasional", desc: "Supply chain & standar" },
];

type FormData = {
  // Modul 1
  description: string;
  vision: string;
  mission: string;
  phone: string;
  website: string;
  socialMedia: string;
  yearFounded: string;
  // Modul 2
  nib: string;
  npwp: string;
  // Modul 3
  outletCount: string;
  outletLocations: string;
  monthlyRevenue: string;
  monthlyTransactions: string;
  averageOrderValue: string;
  operationalCosts: string;
  capitalPerOutlet: string;
  // Modul 4
  supplyChain: string;
  qualityStandard: string;
};

const DEFAULT_FORM: FormData = {
  description: "", vision: "", mission: "", phone: "", website: "", socialMedia: "", yearFounded: "",
  nib: "", npwp: "",
  outletCount: "", outletLocations: "", monthlyRevenue: "", monthlyTransactions: "",
  averageOrderValue: "", operationalCosts: "", capitalPerOutlet: "",
  supplyChain: "", qualityStandard: "",
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [brandName, setBrandName] = useState("");

  // Load existing profile on mount
  useEffect(() => {
    fetch("/api/brands/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.brand) {
          setBrandName(d.brand.name || "");
          setForm({
            description: d.brand.description || "",
            vision: d.brand.vision || "",
            mission: d.brand.mission || "",
            phone: d.brand.phone || "",
            website: d.brand.website || "",
            socialMedia: d.brand.socialMedia || "",
            yearFounded: d.brand.yearFounded?.toString() || "",
            nib: d.brand.nib || "",
            npwp: d.brand.npwp || "",
            outletCount: d.brand.outletCount?.toString() || "",
            outletLocations: d.brand.outletLocations || "",
            monthlyRevenue: d.brand.monthlyRevenue?.toString() || "",
            monthlyTransactions: d.brand.monthlyTransactions?.toString() || "",
            averageOrderValue: d.brand.averageOrderValue?.toString() || "",
            operationalCosts: d.brand.operationalCosts?.toString() || "",
            capitalPerOutlet: d.brand.capitalPerOutlet?.toString() || "",
            supplyChain: d.brand.supplyChain || "",
            qualityStandard: d.brand.qualityStandard || "",
          });
        }
      })
      .catch(console.error);
  }, []);

  const upd = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const saveStep = async (isLast = false) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/brands/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, markComplete: isLast }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const ok = await saveStep(activeStep === MODULES.length - 1);
    if (!ok) return;
    if (activeStep < MODULES.length - 1) {
      setActiveStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/review/pending");
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progressPercent = Math.round(((activeStep + 1) / MODULES.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-[1000px] mx-auto w-full flex flex-col md:flex-row py-10 px-4 gap-10">

        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0 hidden md:block">
          <div className="sticky top-10">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Lengkapi Profil</h1>
            <p className="text-xs text-gray-500 mb-6">{brandName}</p>
            <div className="relative">
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200" />
              <div className="space-y-5 relative z-10">
                {MODULES.map((mod, i) => {
                  const isDone = i < activeStep;
                  const isActive = activeStep === i;
                  return (
                    <div key={i} className={cn("flex items-start gap-3 cursor-pointer", isActive || isDone ? "opacity-100" : "opacity-50")} onClick={() => setActiveStep(i)}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 transition-all",
                        isDone ? "border-green-500 text-green-500" : isActive ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-400"
                      )}>
                        {isDone ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">{mod.id}</span>}
                      </div>
                      <div className="pt-1.5">
                        <p className={cn("text-sm font-semibold", isActive ? "text-blue-700" : isDone ? "text-gray-900" : "text-gray-500")}>{mod.title}</p>
                        <p className="text-xs text-gray-400">{mod.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Tahap {activeStep + 1} dari {MODULES.length}</p>
              <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">{MODULES[activeStep].title}</h2>

              {activeStep === 0 && (
                <div className="space-y-5 max-w-2xl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Tahun Berdiri" type="number" value={form.yearFounded} onChange={upd("yearFounded")} placeholder="2020" />
                    <Field label="Nomor Telepon" value={form.phone} onChange={upd("phone")} placeholder="0812-..." />
                    <Field label="Website" value={form.website} onChange={upd("website")} placeholder="https://..." />
                    <Field label="Media Sosial" value={form.socialMedia} onChange={upd("socialMedia")} placeholder="@instagram" />
                  </div>
                  <Field label="Deskripsi Brand" type="textarea" value={form.description} onChange={upd("description")} placeholder="Ceritakan tentang brand Anda..." />
                  <Field label="Visi" type="textarea" value={form.vision} onChange={upd("vision")} placeholder="Visi brand Anda..." />
                  <Field label="Misi" type="textarea" value={form.mission} onChange={upd("mission")} placeholder="Misi brand Anda..." />
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-5 max-w-2xl">
                  <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    Data legalitas ini akan diverifikasi oleh tim NusaArtha sebelum brand disetujui.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Nomor Induk Berusaha (NIB)" value={form.nib} onChange={upd("nib")} placeholder="Masukkan NIB" />
                    <Field label="NPWP Usaha / Pribadi" value={form.npwp} onChange={upd("npwp")} placeholder="Masukkan NPWP" />
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-semibold mb-1">Upload Dokumen Fisik</p>
                    <p className="text-xs">Dokumen (NIB, NPWP, identitas pemilik, sertifikat merek) dapat dikirimkan via email ke <strong>verify@nusaartha.id</strong> atau melalui WhatsApp tim verifikasi. Fitur upload langsung akan segera tersedia.</p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-5 max-w-2xl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Jumlah Outlet Aktif" type="number" value={form.outletCount} onChange={upd("outletCount")} placeholder="5" />
                    <Field label="Rata-rata Transaksi/Bulan" type="number" value={form.monthlyTransactions} onChange={upd("monthlyTransactions")} placeholder="1500" />
                    <Field label="Omzet Rata-rata Bulanan (Rp)" type="number" value={form.monthlyRevenue} onChange={upd("monthlyRevenue")} placeholder="50000000" />
                    <Field label="Average Order Value (Rp)" type="number" value={form.averageOrderValue} onChange={upd("averageOrderValue")} placeholder="35000" />
                    <Field label="Biaya Operasional Bulanan (Rp)" type="number" value={form.operationalCosts} onChange={upd("operationalCosts")} placeholder="20000000" />
                    <Field label="Estimasi Modal per Outlet (Rp)" type="number" value={form.capitalPerOutlet} onChange={upd("capitalPerOutlet")} placeholder="150000000" />
                  </div>
                  <Field label="Lokasi Outlet yang Sudah Beroperasi" type="textarea" value={form.outletLocations} onChange={upd("outletLocations")} placeholder="Bandung, Jakarta Selatan, ..." />
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-5 max-w-2xl">
                  <Field
                    label="Sistem Supply Chain"
                    type="textarea"
                    value={form.supplyChain}
                    onChange={upd("supplyChain")}
                    placeholder="Jelaskan proses pengadaan bahan baku: supplier, lead time, distribusi, risiko, dan mitigasinya..."
                  />
                  <Field
                    label="Standar Kualitas Outlet"
                    type="textarea"
                    value={form.qualityStandard}
                    onChange={upd("qualityStandard")}
                    placeholder="Jelaskan standar kualitas: layout, peralatan, bahan baku, pelayanan, kebersihan, tampilan produk..."
                  />
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                    <p className="font-semibold mb-1">Setelah mengirim</p>
                    <p className="text-xs">Data profil Anda akan disimpan dan brand dikirim ke tim NusaArtha untuk proses verifikasi. Estimasi review: 2–5 hari kerja.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Feedback */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          {saved && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />Data tahap ini berhasil disimpan
            </div>
          )}

          {/* Nav */}
          <div className="pt-8 border-t border-gray-200 flex items-center justify-between mt-8">
            <Button variant="outline" onClick={handlePrev} disabled={activeStep === 0 || saving} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Sebelumnya
            </Button>
            <Button onClick={handleNext} disabled={saving} className={cn("gap-2", activeStep === MODULES.length - 1 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {activeStep === MODULES.length - 1 ? "Simpan & Kirim ke Review" : "Simpan & Lanjut"}
              {!saving && activeStep !== MODULES.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Field Component ─────────────────────────────────────────────────────────

function Field({ label, type = "text", value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<any>) => void; placeholder?: string;
}) {
  const cls = "w-full px-3.5 bg-white border border-gray-300 rounded-xl text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-gray-700">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} className={cn(cls, "min-h-[90px] py-3 resize-y")} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={cn(cls, "h-11")} />
      )}
    </div>
  );
}
