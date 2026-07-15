"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Users, Store, Search, Loader2, ChevronRight, Award, UserCheck } from "lucide-react";
import Link from "next/link";

type Operator = {
  id: string;
  name: string | null;
  email: string;
  walletAddress: string | null;
  createdAt: string;
  operatedOutlets: {
    id: string;
    name: string;
    location: string;
    status: string;
    pool: { name: string; brand: { name: string } };
  }[];
};

const FILTER_TABS = [
  { label: "Semua", value: "" },
  { label: "Bertugas", value: "assigned" },
  { label: "Belum Bertugas", value: "unassigned" },
];

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = filter ? `/api/operators?status=${filter}` : "/api/operators";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setOperators(d.operators || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = operators.filter((op) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (op.name || "").toLowerCase().includes(q) ||
      op.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Operator</h1>
          <p className="text-sm text-gray-500">Kelola operator, lihat performa, dan tugaskan ke outlet.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-60"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              filter === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Operator",
            value: operators.length,
            icon: Users,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Bertugas",
            value: operators.filter((o) => o.operatedOutlets.length > 0).length,
            icon: UserCheck,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Belum Bertugas",
            value: operators.filter((o) => o.operatedOutlets.length === 0).length,
            icon: Store,
            color: "text-orange-600 bg-orange-50",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", card.color)}>
              <card.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Operator list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat operator…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada operator ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((op) => {
            const isAssigned = op.operatedOutlets.length > 0;
            return (
              <Link
                key={op.id}
                href={`/admin/operators/${op.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {(op.name || op.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 truncate">{op.name || "—"}</p>
                      {isAssigned && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                          Bertugas
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{op.email}</p>
                    {op.operatedOutlets.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {op.operatedOutlets.map((o) => o.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 font-semibold">
                        {op.operatedOutlets.length} outlet
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(op.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
