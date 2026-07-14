"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus, Minus, Trash2, ShoppingCart, CheckCircle2,
  Loader2, AlertCircle, ArrowLeft, Store,
} from "lucide-react";
import Link from "next/link";

type OutletInfo = {
  id: string;
  name: string;
  location: string;
  status: string;
};

type CartItem = {
  name: string;
  price: number;
  qty: number;
};

type RecentTx = {
  id: string;
  amount: number;
  timestamp: string;
  items: string;
};

function POSContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const outletId = searchParams.get("outletId") || "";

  const [outlet, setOutlet] = useState<OutletInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [recentTx, setRecentTx] = useState<RecentTx[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [loadingOutlet, setLoadingOutlet] = useState(true);

  const loadOutlet = useCallback(async () => {
    if (!outletId) { setLoadingOutlet(false); return; }
    try {
      const res = await fetch(`/api/pos/sync?outletId=${outletId}&limit=10`);
      const data = await res.json();
      setRecentTx(data.transactions || []);
      setTodayRevenue(data.todayRevenue || 0);

      // Get outlet info from pools API
      const outletRes = await fetch(`/api/outlets/${outletId}`);
      if (outletRes.ok) {
        const od = await outletRes.json();
        setOutlet(od.outlet);
      }
    } finally {
      setLoadingOutlet(false);
    }
  }, [outletId]);

  useEffect(() => { loadOutlet(); }, [loadOutlet]);

  const addToCart = () => {
    const price = parseFloat(itemPrice.replace(/\D/g, ""));
    const qty = parseInt(itemQty) || 1;
    if (!itemName || !price) { setError("Isi nama dan harga item."); return; }
    setError("");
    setCart((c) => {
      const existing = c.findIndex((i) => i.name === itemName);
      if (existing >= 0) {
        return c.map((i, idx) => idx === existing ? { ...i, qty: i.qty + qty } : i);
      }
      return [...c, { name: itemName, price, qty }];
    });
    setItemName(""); setItemPrice(""); setItemQty("1");
  };

  const updateQty = (idx: number, delta: number) => {
    setCart((c) => c.map((item, i) => {
      if (i !== idx) return item;
      const newQty = item.qty + delta;
      return newQty <= 0 ? null : { ...item, qty: newQty };
    }).filter(Boolean) as CartItem[]);
  };

  const removeItem = (idx: number) => setCart((c) => c.filter((_, i) => i !== idx));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) { setError("Keranjang kosong."); return; }
    if (!outletId) { setError("Pilih outlet terlebih dahulu."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outletId,
          amount: total,
          items: Object.fromEntries(cart.map((i) => [i.name, { price: i.price, qty: i.qty }])),
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan transaksi");
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadOutlet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!outletId) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 mb-1">Outlet tidak dipilih</p>
            <p className="text-sm text-amber-700 mb-3">Pilih outlet dari dashboard untuk mulai input transaksi.</p>
            <Link href="/operator"><Button variant="outline" size="sm">← Kembali ke Dashboard</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingOutlet) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat data outlet…
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operator" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>
        {outlet && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-gray-900 text-sm">{outlet.name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Tambah Item Transaksi</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Nama Produk</label>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToCart()}
                  placeholder="Kopi Susu, Nasi Goreng, dll"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Harga (Rp)</label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
              <Button onClick={addToCart} className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-10">
                <Plus className="w-4 h-4" /> Tambah ke Keranjang
              </Button>
            </div>
          </div>

          {/* Today stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Statistik Hari Ini</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-[10px] text-green-700 font-semibold uppercase mb-0.5">Revenue Hari Ini</p>
                <p className="text-lg font-bold text-green-700">
                  Rp {(todayRevenue / 1e3).toFixed(0)}K
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-[10px] text-blue-700 font-semibold uppercase mb-0.5">Transaksi</p>
                <p className="text-lg font-bold text-blue-700">{recentTx.length}</p>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          {recentTx.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Transaksi Terakhir</h3>
              <div className="space-y-2">
                {recentTx.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-gray-900">Rp {tx.amount.toLocaleString("id-ID")}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(tx.timestamp).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className="text-[10px] bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">Sukses</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart & Checkout */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-900">Keranjang</h2>
            {cart.length > 0 && (
              <span className="ml-auto text-xs text-gray-500">{cart.length} item</span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Keranjang kosong</p>
              <p className="text-xs text-gray-400 mt-1">Tambah item dari form di sebelah kiri</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-64">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => updateQty(idx, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(idx, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 transition-colors">
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                    <button onClick={() => removeItem(idx)} className="w-7 h-7 rounded-lg bg-white border border-red-100 flex items-center justify-center hover:bg-red-50 ml-1 transition-colors">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total & Submit */}
          <div className="pt-4 border-t border-gray-100 space-y-3 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Transaksi</span>
              <span className="text-xl font-bold text-gray-900">Rp {total.toLocaleString("id-ID")}</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-2.5 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-xl p-2.5 border border-green-100">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />Transaksi berhasil disimpan!
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base gap-2 disabled:bg-orange-300"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {submitting ? "Menyimpan..." : `Catat Transaksi • Rp ${total.toLocaleString("id-ID")}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 gap-3 text-gray-400"><Loader2 className="w-5 h-5 animate-spin" />Loading...</div>}>
      <POSContent />
    </Suspense>
  );
}
