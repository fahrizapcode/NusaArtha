"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Smartphone, CreditCard, Wallet, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "va", title: "Virtual Account", icon: Building2, desc: "Transfer bank otomatis (BCA, Mandiri, BNI, BRI)" },
  { id: "qris", title: "QRIS", icon: Smartphone, desc: "Bayar dengan e-wallet atau m-banking" },
  { id: "cc", title: "Kartu kredit", icon: CreditCard, desc: "Visa, Mastercard, JCB" },
  { id: "ewallet", title: "E-Wallet", icon: Wallet, desc: "GoPay, OVO, Dana, ShopeePay" },
];

type PoolData = {
  id: string;
  name: string;
  pricePerToken: number;
  brand: { name: string };
};

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const poolId = params.id as string;

  const [selectedMethod, setSelectedMethod] = useState("va");
  const [pool, setPool] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);

  // Read token qty from query params (set by invest page)
  const qty = parseInt(searchParams.get("qty") || "1");

  useEffect(() => {
    if (!poolId) return;
    fetch(`/api/pools/${poolId}`)
      .then((r) => r.json())
      .then((d) => setPool(d.pool))
      .finally(() => setLoading(false));
  }, [poolId]);

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto py-16 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data kampanye…
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="max-w-[800px] mx-auto py-16 flex flex-col items-center gap-4 text-gray-500">
        <AlertCircle className="w-10 h-10 text-gray-300" />
        <p>Campaign tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
          Kembali
        </button>
      </div>
    );
  }

  const subtotal = qty * pool.pricePerToken;
  const serviceFee = Math.round(subtotal * 0.01); // 1% service fee
  const total = subtotal + serviceFee;
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-[800px] mx-auto py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke investasi
      </button>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Metode pembayaran</h1>
            <p className="text-sm text-gray-500 mb-6">
              Pilih metode pembayaran untuk menyelesaikan investasi Anda.
            </p>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    selectedMethod === method.id
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    selectedMethod === method.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={cn("font-semibold text-sm", selectedMethod === method.id ? "text-blue-900" : "text-gray-900")}>
                      {method.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                  </div>
                  <div className="ml-auto">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      selectedMethod === method.id ? "border-blue-600" : "border-gray-300"
                    )}>
                      {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Notice */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
              <strong>Catatan:</strong> Fitur pembayaran fiat sedang dalam pengembangan. Untuk saat ini,
              gunakan alur investasi via Freighter Wallet untuk mencatat investasi on-chain secara langsung.
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Ringkasan investasi</h3>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm shrink-0">
                {pool.brand.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{pool.name}</p>
                <p className="text-xs text-gray-500">{qty} token · {pool.brand.name}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Harga per token</span>
                <span className="font-medium text-gray-900">{fmt(pool.pricePerToken)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Jumlah token</span>
                <span className="font-medium text-gray-900">{qty}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Biaya layanan (1%)</span>
                <span className="font-medium text-gray-900">{fmt(serviceFee)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total tagihan</span>
                <span className="text-lg font-bold text-blue-600">{fmt(total)}</span>
              </div>
            </div>

            <Link href={`/investor/dashboard/marketplace/${poolId}/success?qty=${qty}`} className="block w-full">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Bayar sekarang
              </Button>
            </Link>

            <p className="text-center text-xs text-gray-400 mt-3">
              Dengan melanjutkan, Anda menyetujui syarat & ketentuan platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
