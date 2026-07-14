"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  BadgeCheck,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Star
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Semua", "F&B", "Retail", "Fashion", "Jasa"];
const STATUS_OPTIONS = ["Campaign Aktif", "Hampir Selesai", "Baru Dibuka"];
const RISK_OPTIONS = ["Low", "Medium", "High"];

const DUMMY_CAMPAIGNS = [
  {
    id: 1,
    brandName: "Kopi Nusantara",
    outletName: "Outlet BSD City",
    category: "F&B",
    location: "Tangerang Selatan, Banten",
    target: "Rp 250.000.000",
    collected: "Rp 175.000.000",
    progress: 70,
    investors: 12,
    daysLeft: 18,
    readinessScore: 92,
    risk: "Low",
    roi: "18-24%",
    bep: "14 Bulan",
    tokenPrice: "Rp 100.000",
    minPurchase: "Rp 1.000.000",
  },
  {
    id: 2,
    brandName: "Ayam Geprek Maknyus",
    outletName: "Outlet Cihampelas",
    category: "F&B",
    location: "Bandung, Jawa Barat",
    target: "Rp 150.000.000",
    collected: "Rp 135.000.000",
    progress: 90,
    investors: 25,
    daysLeft: 3,
    readinessScore: 88,
    risk: "Medium",
    roi: "20-30%",
    bep: "12 Bulan",
    tokenPrice: "Rp 50.000",
    minPurchase: "Rp 500.000",
  },
  {
    id: 3,
    brandName: "Sneakers Lokal",
    outletName: "Store Sudirman",
    category: "Fashion",
    location: "Jakarta Pusat, DKI Jakarta",
    target: "Rp 400.000.000",
    collected: "Rp 60.000.000",
    progress: 15,
    investors: 4,
    daysLeft: 25,
    readinessScore: 85,
    risk: "Medium",
    roi: "15-20%",
    bep: "18 Bulan",
    tokenPrice: "Rp 500.000",
    minPurchase: "Rp 5.000.000",
  },
];

export default function MarketplacePage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Marketplace campaign outlet</h1>
        <p className="text-sm text-gray-500 mt-1">Temukan peluang investasi pada outlet franchise yang sedang membuka pendanaan.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari brand atau lokasi outlet..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
          <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </Button>
          <select className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none text-gray-700 min-w-[100px]">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none text-gray-700 min-w-[100px]">
            {STATUS_OPTIONS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none text-gray-700 min-w-[100px]">
            <option>Urutkan: Terbaru</option>
            <option>Pendanaan Tercepat</option>
            <option>ROI Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
        {DUMMY_CAMPAIGNS.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col group overflow-hidden">
            {/* Header Area */}
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
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">{campaign.outletName}</p>
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
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Target Pendanaan</p>
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
                      "h-full rounded-full transition-all duration-1000",
                      campaign.progress >= 90 ? "bg-orange-500" : "bg-blue-500"
                    )}
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span><span className="font-semibold text-gray-700">{campaign.investors}</span> Investor</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sisa <span className={cn("font-semibold", campaign.daysLeft <= 7 ? "text-orange-600" : "text-gray-700")}>{campaign.daysLeft}</span> hr</span>
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
                  <p className="text-sm font-bold text-gray-700">{campaign.risk}</p>
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

              {/* Footer Specs */}
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
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all">
                  Lihat detail campaign
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
