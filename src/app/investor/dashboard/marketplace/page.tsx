"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { cn } from "@/lib/utils";
import {
  Search, BadgeCheck, MapPin, Users, Clock,
  ChevronRight, ShieldCheck, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useStellarWallet } from "@/lib/stellar/context";

type Campaign = {
  id: string;
  brandName: string;
  outletName: string;
  category: string;
  location: string;
  target: string;
  targetNum: number;
  collected: string;
  collectedNum: number;
  progress: number;
  investors: number;
  daysLeft: number | null;
  readinessScore: number;
  risk: string;
  roi: string;
  bep: string;
  tokenPrice: string;
  minPurchase: string;
  status: string;
};

const CATEGORIES = ["Semua", "F&B", "Retail", "Fashion", "Jasa"];
const SORT_OPTIONS = [
  { label: "Terbaru", val: "newest" },
  { label: "Pendanaan Tertinggi", val: "funded" },
  { label: "Score Tertinggi", val: "score" },
];

const RISK_COLORS: Record<string, string> = {
  MATURE: "text-green-700",
  MEZZANINE: "text-blue-700",
  EMERGING: "text-yellow-700",
  HIGH_RISK: "text-red-700",
  LOW: "text-green-700",
  MEDIUM: "text-yellow-700",
  HIGH: "text-red-700",
};

export default function MarketplacePage() {
  const { isConnected } = useStellarWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("newest");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pools?status=PUBLISHED&status=ACTIVE");
      const data = await res.json();
      const pools = data.pools || [];

      const mapped: Campaign[] = pools.map((pool: any) => {
        const collected = pool.investments.reduce(
          (s: number, inv: any) => s + inv.tokensOwned * pool.pricePerToken, 0
        );
        const progress = Math.min(100, Math.round((collected / pool.targetFunding) * 100));
        const fmt = (n: number) =>
          new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

        // Calculate days left from endDate if available
        let daysLeft: number | null = null;
        if (pool.endDate) {
          const diff = Math.ceil((new Date(pool.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          daysLeft = Math.max(0, diff);
        }

        return {
          id: pool.id,
          brandName: pool.brand.name,
          outletName: pool.name,
          category: pool.brand.businessType,
          location: pool.location,
          target: fmt(pool.targetFunding),
          targetNum: pool.targetFunding,
          collected: fmt(collected),
          collectedNum: collected,
          progress,
          investors: new Set(pool.investments.map((i: any) => i.investorId)).size,
          daysLeft,
          readinessScore: pool.brand.readinessScore || 0,
          risk: pool.brand.riskLevel,
          roi: pool.roiEstimate || "—",
          bep: pool.bepEstimate || "—",
          tokenPrice: fmt(pool.pricePerToken),
          minPurchase: fmt(pool.pricePerToken),
          status: pool.status,
        };
      });

      setCampaigns(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  // Filter + sort
  const filtered = campaigns
    .filter((c) => {
      const matchSearch =
        !search ||
        c.brandName.toLowerCase().includes(search.toLowerCase()) ||
        c.outletName.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Semua" || c.category.toLowerCase().includes(category.toLowerCase());
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "funded") return b.progress - a.progress;
      if (sortBy === "score") return b.readinessScore - a.readinessScore;
      return 0; // newest (already ordered by createdAt from API)
    });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Marketplace campaign outlet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Temukan peluang investasi pada outlet franchise yang sedang membuka pendanaan.
          </p>
        </div>
        {!isConnected && <WalletButton variant="outline" size="sm" />}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari brand atau lokasi outlet..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                category === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {c}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none text-gray-700 min-w-[130px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.val} value={o.val}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results info */}
      {!loading && (
        <p className="text-xs text-gray-500">
          {filtered.length} kampanye ditemukan
          {search && ` untuk "${search}"`}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat kampanye dari database…
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium mb-1">Tidak ada kampanye ditemukan</p>
          <p className="text-sm text-gray-400">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      )}

      {/* Campaign Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
          {filtered.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col group overflow-hidden"
            >
              {/* Card header */}
              <div className="p-5 border-b border-gray-50 bg-gradient-to-br from-gray-50/50 to-white relative">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                    {campaign.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-sm font-bold text-gray-600">
                    {campaign.brandName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{campaign.brandName}</p>
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 truncate max-w-[160px]">{campaign.outletName}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{campaign.location}</span>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Target</p>
                      <p className="text-sm font-bold text-gray-900">{campaign.target}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Terkumpul</p>
                      <p className="text-sm font-bold text-blue-600">{campaign.progress}%</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        campaign.progress >= 90 ? "bg-orange-500" : "bg-blue-500"
                      )}
                      style={{ width: `${Math.max(2, campaign.progress)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span><span className="font-semibold text-gray-700">{campaign.investors}</span> Investor</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {campaign.daysLeft === null ? (
                        <span className="text-gray-500">Tidak ada batas</span>
                      ) : (
                        <span>Sisa <span className={cn("font-semibold", campaign.daysLeft <= 7 ? "text-orange-600" : "text-gray-700")}>{campaign.daysLeft}</span> hr</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="bg-green-50/50 border border-green-100 rounded-lg p-2.5">
                    <p className="text-[10px] text-green-700 font-medium mb-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Brand Score
                    </p>
                    <p className="text-sm font-bold text-green-700">{campaign.readinessScore}/100</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Risk Level</p>
                    <p className={cn("text-sm font-bold", RISK_COLORS[campaign.risk] || "text-gray-700")}>
                      {campaign.risk}
                    </p>
                  </div>
                </div>

                {/* Estimates */}
                <div className="grid grid-cols-2 gap-4 mb-5 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Est. ROI/Tahun</p>
                    <p className="text-sm font-bold text-green-600">{campaign.roi}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Est. BEP</p>
                    <p className="text-sm font-bold text-gray-900">{campaign.bep}</p>
                  </div>
                </div>

                {/* Token specs */}
                <div className="bg-gray-50 rounded-xl p-3 mb-5 text-xs grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-gray-500">Harga Token:</span>
                    <p className="font-semibold text-gray-900">{campaign.tokenPrice}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Min. Beli:</span>
                    <p className="font-semibold text-gray-900">{campaign.minPurchase}</p>
                  </div>
                </div>

                <Link href={`/investor/dashboard/marketplace/${campaign.id}`} className="mt-auto">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 group-hover:shadow-md transition-all">
                    Lihat detail
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
