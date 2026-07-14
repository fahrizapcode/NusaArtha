"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function RegisterBrandPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brandName: "",
    businessType: "",
    ownerName: "",
    ownerId: "",
    nib: "",
    npwp: "",
    hasSOP: "Belum",
    mainProduct: "",
    outletCount: "",
    outletLocation: "",
    monthlyRevenue: "",
    monthlyTransactions: "",
    aov: "",
    capitalPerOutlet: "",
    supplyChain: "",
    qualityStandard: "",
  });

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleSubmit = () => router.push("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-[900px]">
        {/* Stepper Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftarkan Brand Anda</h1>
          <p className="text-gray-500">Lengkapi informasi di bawah untuk memulai onboarding</p>
        </div>

        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-200 -z-10 -translate-y-1/2">
            <div 
              className="h-full bg-green-600 transition-all duration-300" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
          {[
            { num: 1, label: "Informasi Brand" },
            { num: 2, label: "Legalitas & Operasional" },
            { num: 3, label: "Data Bisnis" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors",
                  step > s.num
                    ? "bg-green-600 border-green-600 text-white"
                    : step === s.num
                    ? "bg-white border-green-600 text-green-600"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className={cn("text-sm font-medium", step >= s.num ? "text-gray-900" : "text-gray-400")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <StepOne formData={formData} updateForm={updateForm} />
              )}
              {step === 2 && (
                <StepTwo formData={formData} updateForm={updateForm} />
              )}
              {step === 3 && (
                <StepThree formData={formData} updateForm={updateForm} />
              )}
            </motion.div>
          </div>

          <div className="bg-gray-50 border-t border-gray-100 p-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
              className="text-gray-600"
            >
              Kembali
            </Button>
            
            <div className="flex gap-3">
              {step === 3 && (
                <Button variant="outline" className="text-gray-600 hidden sm:flex">
                  Simpan Draft
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700 text-white">
                  Lanjut
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                  Daftarkan Brand
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 ──────────────────────────────────────────────────────────────────

function StepOne({ formData, updateForm }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Brand</h3>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Nama Brand <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Contoh: Kopi Nusantara"
              value={formData.brandName}
              onChange={(e) => updateForm("brandName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Jenis Usaha <span className="text-red-500">*</span></Label>
            <select
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              value={formData.businessType}
              onChange={(e) => updateForm("businessType", e.target.value)}
            >
              <option value="" disabled>Pilih Jenis Usaha</option>
              <option value="fnb">F&B</option>
              <option value="retail">Retail</option>
              <option value="fashion">Fashion</option>
              <option value="jasa">Jasa</option>
              <option value="pendidikan">Pendidikan</option>
              <option value="kesehatan">Kesehatan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pemilik</h3>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Nama Pemilik Usaha <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Nama Lengkap"
              value={formData.ownerName}
              onChange={(e) => updateForm("ownerName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Nomor Identitas Pemilik <span className="text-red-500">*</span></Label>
            <Input
              placeholder="NIK / Nomor Paspor"
              value={formData.ownerId}
              onChange={(e) => updateForm("ownerId", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────

function StepTwo({ formData, updateForm }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legalitas Dasar</h3>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Nomor Induk Berusaha (NIB)</Label>
            <Input
              placeholder="Masukkan NIB"
              value={formData.nib}
              onChange={(e) => updateForm("nib", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>NPWP Usaha / Pribadi</Label>
            <Input
              placeholder="Masukkan NPWP"
              value={formData.npwp}
              onChange={(e) => updateForm("npwp", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Bukti Kepemilikan Brand (Opsional)</Label>
            <p className="text-xs text-gray-500">Opsional. Dapat berupa sertifikat merek atau dokumen pendukung lainnya.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
                <UploadCloud className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Klik untuk upload atau drag & drop</p>
              <p className="text-xs text-gray-500 mt-1">Support: PDF, PNG, JPG (Max. 10MB)</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operasional Dasar</h3>
        <div className="grid gap-5">
          <div className="grid gap-3">
            <Label>Apakah memiliki SOP Operasional?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasSOP"
                  value="Ya"
                  checked={formData.hasSOP === "Ya"}
                  onChange={(e) => updateForm("hasSOP", e.target.value)}
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Ya</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasSOP"
                  value="Belum"
                  checked={formData.hasSOP === "Belum"}
                  onChange={(e) => updateForm("hasSOP", e.target.value)}
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Belum</span>
              </label>
            </div>
          </div>
          
          {formData.hasSOP === "Ya" && (
            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>Upload SOP</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all group">
                <UploadCloud className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload Dokumen SOP</p>
                <p className="text-xs text-gray-500 mt-1">PDF atau DOCX (Max. 10MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk</h3>
        <div className="grid gap-2">
          <Label>Produk/Menu Utama</Label>
          <Textarea
            placeholder="Jelaskan produk atau layanan utama yang ditawarkan."
            value={formData.mainProduct}
            onChange={(e) => updateForm("mainProduct", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────

function StepThree({ formData, updateForm }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outlet</h3>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Jumlah Outlet Aktif</Label>
            <Input
              type="number"
              placeholder="Contoh: 5"
              value={formData.outletCount}
              onChange={(e) => updateForm("outletCount", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Lokasi Outlet</Label>
            <Textarea
              placeholder="Bandung, Jakarta Selatan, Bekasi, dll."
              value={formData.outletLocation}
              onChange={(e) => updateForm("outletLocation", e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histori Penjualan</h3>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Omzet Rata-rata Bulanan</Label>
            <CurrencyInput
              placeholder="Rp 0"
              value={formData.monthlyRevenue}
              onChange={(e: any) => updateForm("monthlyRevenue", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Jumlah Transaksi Bulanan</Label>
            <Input
              type="number"
              placeholder="Contoh: 1500"
              value={formData.monthlyTransactions}
              onChange={(e) => updateForm("monthlyTransactions", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Average Order Value (AOV)</Label>
            <CurrencyInput
              placeholder="Rp 0"
              value={formData.aov}
              onChange={(e: any) => updateForm("aov", e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operasional</h3>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Estimasi Modal per Outlet</Label>
            <CurrencyInput
              placeholder="Rp 0"
              value={formData.capitalPerOutlet}
              onChange={(e: any) => updateForm("capitalPerOutlet", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Sistem Supply Chain</Label>
            <Textarea
              placeholder="Jelaskan proses pengadaan bahan baku dan distribusi."
              value={formData.supplyChain}
              onChange={(e) => updateForm("supplyChain", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Standar Kualitas Outlet</Label>
            <Textarea
              placeholder="Jelaskan standar kualitas dan operasional yang diterapkan pada seluruh outlet."
              value={formData.qualityStandard}
              onChange={(e) => updateForm("qualityStandard", e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Data</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Nama Brand</span>
            <span className="font-medium text-gray-900">{formData.brandName || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Jenis Usaha</span>
            <span className="font-medium text-gray-900 capitalize">{formData.businessType || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Nama Pemilik</span>
            <span className="font-medium text-gray-900">{formData.ownerName || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Jumlah Outlet</span>
            <span className="font-medium text-gray-900">{formData.outletCount || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── UI Components (Local) ───────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all",
        props.className
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-[100px] px-3 py-3 bg-white border border-gray-300 rounded-md text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-y",
        props.className
      )}
    />
  );
}

function CurrencyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 text-sm">Rp</span>
      </div>
      <Input {...props} className={cn("pl-9", props.className)} />
    </div>
  );
}
