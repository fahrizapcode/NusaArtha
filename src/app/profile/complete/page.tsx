"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, UploadCloud, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  { id: 1, title: "Informasi Brand", desc: "Identitas dasar brand" },
  { id: 2, title: "Legalitas", desc: "Dokumen dan perizinan" },
  { id: 3, title: "Penjualan", desc: "Data performa bisnis" },
  { id: 4, title: "SOP Operasional", desc: "Standar operasional" },
  { id: 5, title: "Produk", desc: "Daftar produk" },
  { id: 6, title: "Modal Outlet", desc: "Estimasi investasi" },
  { id: 7, title: "Supply Chain", desc: "Distribusi & supplier" },
  { id: 8, title: "Standar Kualitas", desc: "Quality control outlet" }
];

const MODULE_DESCRIPTIONS = [
  "Lengkapi identitas dasar brand Anda untuk memudahkan investor mengenali bisnis Anda.",
  "Lengkapi seluruh dokumen legalitas usaha sebagai syarat proses verifikasi oleh platform.",
  "Masukkan data performa bisnis Anda untuk memberikan gambaran kesehatan finansial.",
  "Unggah dokumen SOP untuk membuktikan standarisasi operasional bisnis Anda.",
  "Daftarkan produk atau layanan utama yang ditawarkan oleh brand Anda.",
  "Berikan estimasi modal yang dibutuhkan untuk membuka satu outlet baru.",
  "Jelaskan sistem distribusi dan pengadaan bahan baku utama bisnis Anda.",
  "Tentukan standar kualitas yang diberlakukan di seluruh jaringan outlet Anda."
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps((prev) => [...prev, activeStep]);
    }
    if (activeStep < MODULES.length - 1) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push("/review/pending");
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const progressPercent = Math.round(((activeStep + 1) / MODULES.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="max-w-[1100px] mx-auto w-full flex flex-col md:flex-row flex-1 py-10 px-4 gap-10">
        
        {/* Mobile Horizontal Stepper */}
        <div className="md:hidden w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6 flex overflow-x-auto gap-4 hide-scrollbar">
           {MODULES.map((mod, i) => {
             const isCompleted = completedSteps.includes(i) || i < activeStep;
             const isActive = activeStep === i;
             return (
               <div key={i} className="flex flex-col items-center flex-shrink-0 w-24">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all",
                    isCompleted ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400 border border-gray-200"
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : mod.id}
                  </div>
                  <span className={cn(
                    "text-[10px] text-center font-medium leading-tight",
                    isCompleted || isActive ? "text-gray-900" : "text-gray-400"
                  )}>
                    {mod.title}
                  </span>
               </div>
             )
           })}
        </div>

        {/* Sidebar Vertical Stepper (Desktop) */}
        <aside className="w-[260px] flex-shrink-0 hidden md:block">
          <div className="sticky top-10">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Profil Brand</h1>
            
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200" />
              
              <div className="space-y-6 relative z-10">
                {MODULES.map((mod, i) => {
                  const isCompleted = completedSteps.includes(i) || i < activeStep;
                  const isActive = activeStep === i;
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex items-start gap-4 cursor-pointer group",
                        isActive || isCompleted ? "opacity-100" : "opacity-60 hover:opacity-100 transition-opacity"
                      )}
                      onClick={() => setActiveStep(i)}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all bg-white relative",
                        isCompleted 
                          ? "border-2 border-green-500 text-green-500" 
                          : isActive 
                            ? "border-2 border-blue-600 bg-blue-50 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]" 
                            : "border-2 border-gray-300 text-gray-400"
                      )}>
                        {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">{mod.id}</span>}
                      </div>
                      <div className="pt-1.5">
                        <p className={cn(
                          "text-sm font-semibold leading-none mb-1.5",
                          isActive ? "text-blue-700" : isCompleted ? "text-gray-900" : "text-gray-500"
                        )}>
                          {mod.title}
                        </p>
                        <p className="text-xs text-gray-500">{mod.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Form Content Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Progress Header */}
          <div className="mb-10">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Profil Brand</p>
                <p className="text-gray-900 font-semibold">{activeStep + 1} dari {MODULES.length} Tahapan</p>
              </div>
              <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{MODULES[activeStep].title}</h2>
                  <p className="text-gray-500">{MODULE_DESCRIPTIONS[activeStep]}</p>
                </div>

                {/* Modules Wrapper */}
                <div className="pb-10">
                  {activeStep === 0 && <ModulInformasiBrand />}
                  {activeStep === 1 && <ModulLegalitas />}
                  {activeStep === 2 && <ModulPenjualan />}
                  {activeStep === 3 && <ModulSOP />}
                  {activeStep === 4 && <ModulProduk />}
                  {activeStep === 5 && <ModulEstimasiModal />}
                  {activeStep === 6 && <ModulSupplyChain />}
                  {activeStep === 7 && <ModulStandarKualitas />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Bar */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-between mt-auto">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={activeStep === 0}
              className="text-gray-600 gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Sebelumnya
            </Button>
            
            <Button 
              onClick={handleNext} 
              className={cn(
                "font-semibold gap-2 shadow-sm",
                activeStep === MODULES.length - 1 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {activeStep === MODULES.length - 1 ? "Kirim untuk Review Platform" : "Selanjutnya"}
              {activeStep !== MODULES.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </main>

      </div>
    </div>
  );
}

// ─── Module Components (Simulated UI) ────────────────────────────────────────

function ModulInformasiBrand() {
  return (
    <div className="grid gap-6 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormGroup label="Nama Brand" placeholder="Masukkan nama brand" />
        <FormGroup label="Jenis Usaha" type="select" options={["F&B", "Retail", "Fashion", "Jasa", "Pendidikan", "Kesehatan", "Lainnya"]} />
        <FormGroup label="Tahun Berdiri" placeholder="Contoh: 2020" type="number" />
        <FormGroup label="Nama Pemilik" placeholder="Nama lengkap" />
        <FormGroup label="Identitas Pemilik" placeholder="NIK / KTP / Paspor" />
        <FormGroup label="Email" placeholder="email@brand.com" type="email" />
        <FormGroup label="Nomor Telepon" placeholder="08..." />
        <FormGroup label="Website" placeholder="https://" />
      </div>
      <FormGroup label="Media Sosial" placeholder="@instagram, dll" />
      <FormGroup label="Deskripsi Brand" type="textarea" placeholder="Ceritakan tentang brand Anda secara singkat..." />
      <FormGroup label="Visi" type="textarea" placeholder="Visi perusahaan Anda..." />
      <FormGroup label="Misi" type="textarea" placeholder="Misi perusahaan Anda..." />
    </div>
  );
}

function ModulLegalitas() {
  return (
    <div className="grid gap-8 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormGroup label="Nomor Induk Berusaha (NIB)" placeholder="Masukkan NIB" />
        <FormGroup label="Nomor NPWP" placeholder="Masukkan NPWP" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Dokumen Pendukung</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <UploadBox label="Upload Dokumen NIB" />
          <UploadBox label="Upload Dokumen NPWP" />
          <UploadBox label="Upload Identitas Pemilik" />
          <UploadBox label="Upload Bukti Kepemilikan Brand" />
          <UploadBox label="Upload Sertifikat HKI (Opsional)" />
          <UploadBox label="Upload Dokumen Izin Tambahan" />
        </div>
      </div>
    </div>
  );
}

function ModulPenjualan() {
  return (
    <div className="grid gap-10 max-w-4xl">
      <div className="grid sm:grid-cols-2 gap-6">
        <FormGroup label="Omzet Rata-rata Bulanan" placeholder="Rp 0" isCurrency />
        <FormGroup label="Jumlah Transaksi Bulanan" placeholder="0" type="number" />
        <FormGroup label="Average Order Value" placeholder="Rp 0" isCurrency />
        <FormGroup label="Biaya Operasional Bulanan" placeholder="Rp 0" isCurrency />
        <FormGroup label="Musim Ramai" placeholder="Contoh: Lebaran, Liburan Sekolah" />
        <FormGroup label="Musim Sepi" placeholder="Contoh: Awal Tahun" />
        <FormGroup label="Produk Paling Laku" placeholder="Nama produk" />
        <FormGroup label="Tren Pertumbuhan" type="select" options={["Meningkat Tajam", "Meningkat Stabil", "Stagnan", "Menurun"]} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
          <h3 className="font-semibold text-gray-900">Data Outlet Aktif</h3>
          <Button variant="outline" size="sm" className="h-8 gap-1 border-gray-300"><Plus className="w-4 h-4"/> Tambah Outlet</Button>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Nama Outlet</th>
                <th className="px-4 py-3">Kota</th>
                <th className="px-4 py-3">Omzet</th>
                <th className="px-4 py-3">Transaksi</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">Outlet Pusat</td>
                <td className="px-4 py-3 text-gray-600">Jakarta Selatan</td>
                <td className="px-4 py-3 text-gray-600">Rp 150.000.000</td>
                <td className="px-4 py-3 text-gray-600">3.200</td>
                <td className="px-4 py-3"><span className="text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-medium">Aktif</span></td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">Cabang Bandung</td>
                <td className="px-4 py-3 text-gray-600">Bandung</td>
                <td className="px-4 py-3 text-gray-600">Rp 80.000.000</td>
                <td className="px-4 py-3 text-gray-600">1.500</td>
                <td className="px-4 py-3"><span className="text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-medium">Aktif</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ModulSOP() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
      <UploadBox label="SOP Pembukaan Outlet" />
      <UploadBox label="SOP Pelayanan" />
      <UploadBox label="SOP Produksi" />
      <UploadBox label="SOP Kebersihan" />
      <UploadBox label="SOP Manajemen Stok" />
      <UploadBox label="SOP Closing Harian" />
      <UploadBox label="SOP Penanganan Komplain" />
      <UploadBox label="SOP Audit Outlet" />
    </div>
  );
}

function ModulProduk() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h3 className="font-semibold text-gray-900">Katalog Produk Utama</h3>
        <Button variant="outline" size="sm" className="h-8 gap-1 border-gray-300"><Plus className="w-4 h-4"/> Tambah Produk</Button>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Nama Produk</th>
              <th className="px-4 py-3">Harga Jual</th>
              <th className="px-4 py-3">HPP</th>
              <th className="px-4 py-3">Margin</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Risiko Pasokan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">Kopi Susu Gula Aren</td>
              <td className="px-4 py-3 text-gray-600">Rp 22.000</td>
              <td className="px-4 py-3 text-gray-600">Rp 8.500</td>
              <td className="px-4 py-3"><span className="text-green-600 font-medium">61%</span></td>
              <td className="px-4 py-3 text-gray-600">Minuman <span className="ml-1 bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-sm font-bold">BEST</span></td>
              <td className="px-4 py-3 text-gray-600">Rendah</td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">Croffle Butter</td>
              <td className="px-4 py-3 text-gray-600">Rp 28.000</td>
              <td className="px-4 py-3 text-gray-600">Rp 12.000</td>
              <td className="px-4 py-3"><span className="text-green-600 font-medium">57%</span></td>
              <td className="px-4 py-3 text-gray-600">Makanan</td>
              <td className="px-4 py-3 text-gray-600">Sedang</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModulEstimasiModal() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-6">
        <FormGroup label="Renovasi & Konstruksi" placeholder="Rp 0" isCurrency />
        <FormGroup label="Sewa Tempat (Pertahun)" placeholder="Rp 0" isCurrency />
        <FormGroup label="Peralatan & Mesin" placeholder="Rp 0" isCurrency />
        <FormGroup label="Bahan Baku Awal" placeholder="Rp 0" isCurrency />
        <FormGroup label="Biaya Rekrutmen & Training" placeholder="Rp 0" isCurrency />
        <FormGroup label="Marketing Awal" placeholder="Rp 0" isCurrency />
        <FormGroup label="Gaji Awal (Bulan ke-1)" placeholder="Rp 0" isCurrency />
        <FormGroup label="Working Capital" placeholder="Rp 0" isCurrency />
        <FormGroup label="Cadangan Operasional" placeholder="Rp 0" isCurrency />
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-blue-800 font-medium block">Total Estimasi Modal per Outlet</span>
          <span className="text-sm text-blue-600/80 mt-1 block">Ini adalah nilai referensi yang akan dilihat investor/franchisee.</span>
        </div>
        <span className="text-3xl font-bold text-blue-700">Rp 0</span>
      </div>
    </div>
  );
}

function ModulSupplyChain() {
  return (
    <div className="grid gap-8 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-6">
        <FormGroup label="Supplier Utama" placeholder="Nama entitas supplier" />
        <FormGroup label="Lead Time Pemesanan" placeholder="Contoh: 3 Hari" />
        <FormGroup label="Minimum Order Quantity (MOQ)" placeholder="Contoh: Rp 5.000.000 / 100kg" />
        <FormGroup label="Sistem Distribusi" placeholder="Contoh: Diantar langsung / Ekspedisi" />
        <FormGroup label="Estimasi Biaya Logistik (%)" placeholder="Berapa % dari nilai bahan baku" type="number" />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-8 pt-2">
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-3">Asal Bahan Baku Utama</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input type="radio" name="asal" className="w-4 h-4 text-blue-600 focus:ring-blue-500" defaultChecked /> Disediakan oleh Pusat
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input type="radio" name="asal" className="w-4 h-4 text-blue-600 focus:ring-blue-500" /> Pengadaan Lokal (Mitra)
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
              <input type="radio" name="asal" className="w-4 h-4 text-blue-600 focus:ring-blue-500" /> Kombinasi Pusat & Lokal
            </label>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-3">Kewajiban Pembelian Bahan Baku</label>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
             <span className="text-sm text-gray-700 font-medium">Wajib beli dari Pusat?</span>
             <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
               <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
             </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6">
        <FormGroup label="Risiko Keterlambatan Pasokan" type="textarea" placeholder="Apa risiko yang mungkin terjadi dan dampaknya terhadap operasional..." />
        <FormGroup label="Mitigasi & Alternatif Supplier" type="textarea" placeholder="Jelaskan langkah mitigasi atau opsi supplier cadangan..." />
      </div>
    </div>
  );
}

function ModulStandarKualitas() {
  return (
    <div className="grid gap-8 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-6">
        <FormGroup label="Standar Layout & Desain Outlet" placeholder="Deskripsi spesifikasi desain..." type="textarea" />
        <FormGroup label="Standar Peralatan Dapur/Toko" placeholder="Merek/spesifikasi wajib..." type="textarea" />
        <FormGroup label="Standar Penerimaan Bahan Baku" placeholder="Suhu, warna, tekstur..." type="textarea" />
        <FormGroup label="Standar Pelayanan Pelanggan" placeholder="SOP sapaan, SLA layanan..." type="textarea" />
        <FormGroup label="Standar Kebersihan (Sanitasi)" placeholder="Jadwal pembersihan, bahan pembersih..." type="textarea" />
        <FormGroup label="Standar Tampilan & Rasa Produk" placeholder="Takaran, presentasi visual..." type="textarea" />
      </div>
      
      <div>
        <label className="text-sm font-semibold text-gray-900 block mb-4 border-b border-gray-100 pb-2">Checklist Quality Control (Audit Outlet)</label>
        <div className="space-y-3 bg-white">
           <label className="flex items-start gap-3 text-sm cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
             <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500" defaultChecked /> 
             <div>
               <p className="font-medium text-gray-900">Audit Kebersihan Fisik</p>
               <p className="text-gray-500 mt-0.5">Memeriksa kebersihan area makan, dapur, dan toilet.</p>
             </div>
           </label>
           <label className="flex items-start gap-3 text-sm cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
             <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500" defaultChecked /> 
             <div>
               <p className="font-medium text-gray-900">Uji Konsistensi Produk</p>
               <p className="text-gray-500 mt-0.5">Mencicipi atau mengecek produk secara acak (blind test).</p>
             </div>
           </label>
           <label className="flex items-start gap-3 text-sm cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
             <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500" defaultChecked /> 
             <div>
               <p className="font-medium text-gray-900">Pengecekan Masa Berlaku (Expired Date)</p>
               <p className="text-gray-500 mt-0.5">Memastikan tidak ada bahan baku yang kadaluarsa.</p>
             </div>
           </label>
           <label className="flex items-start gap-3 text-sm cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
             <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500" defaultChecked /> 
             <div>
               <p className="font-medium text-gray-900">Review Laporan Keuangan Harian</p>
               <p className="text-gray-500 mt-0.5">Pencocokan stok dan kas untuk menghindari fraud.</p>
             </div>
           </label>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FormGroup({ label, type = "text", placeholder, options, isCurrency }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-gray-700">{label}</label>
      {type === "textarea" ? (
        <textarea 
          placeholder={placeholder} 
          className="w-full min-h-[90px] px-3.5 py-3 bg-white border border-gray-300 rounded-xl text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-y shadow-sm" 
        />
      ) : type === "select" ? (
        <select className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm">
          <option value="">Pilih...</option>
          {options?.map((o: any, i: number) => <option key={i}>{o}</option>)}
        </select>
      ) : isCurrency ? (
        <div className="relative shadow-sm rounded-xl overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-11 bg-gray-50 border-r border-gray-300 flex items-center justify-center pointer-events-none">
            <span className="text-sm font-medium text-gray-500">Rp</span>
          </div>
          <input 
            type="text" 
            placeholder={placeholder} 
            className="w-full h-11 pl-14 pr-4 bg-white border border-gray-300 rounded-xl text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all" 
          />
        </div>
      ) : (
        <input 
          type={type} 
          placeholder={placeholder} 
          className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm" 
        />
      )}
    </div>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-sm transition-all group">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 text-gray-400 transition-colors">
        <UploadCloud className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <span className="text-xs text-gray-500 mt-1">Pilih file atau drag kesini</span>
    </div>
  );
}
