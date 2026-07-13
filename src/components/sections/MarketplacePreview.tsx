"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp } from "lucide-react";

const marketplaceItems = [
  {
    name: "Kopi Kenangan",
    location: "Sudirman, Jakarta",
    progress: 85,
    target: "Rp 1.5 M",
    risk: "Low",
    score: 92,
    roi: "18-22%",
    bep: "14 Bulan",
    logoColor: "bg-amber-800",
    shortName: "KK",
  },
  {
    name: "Haus!",
    location: "Depok, Jawa Barat",
    progress: 45,
    target: "Rp 800 Juta",
    risk: "Medium",
    score: 85,
    roi: "20-25%",
    bep: "12 Bulan",
    logoColor: "bg-red-600",
    shortName: "HS",
  },
  {
    name: "Es Teh Indonesia",
    location: "Malang, Jawa Timur",
    progress: 100,
    target: "Rp 500 Juta",
    risk: "Low",
    score: 88,
    roi: "15-20%",
    bep: "10 Bulan",
    logoColor: "bg-green-700",
    shortName: "ET",
  },
  {
    name: "Bakmi GM",
    location: "Kelapa Gading, Jakarta",
    progress: 20,
    target: "Rp 2.5 M",
    risk: "Low",
    score: 95,
    roi: "16-19%",
    bep: "18 Bulan",
    logoColor: "bg-yellow-500",
    shortName: "GM",
  },
];

export function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
              Peluang Investasi Terkurasi
            </h2>
            <p className="text-lg text-gray-500">
              Setiap brand telah melewati proses due diligence ketat dan siap untuk diekspansi bersama.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 font-semibold bg-white">
            Lihat Semua Peluang
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketplaceItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-xl shrink-0 ${item.logoColor}`}>
                  {item.shortName}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.location}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col gap-5">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Target Dana</div>
                    <div className="font-semibold text-gray-900">{item.target}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Estimasi BEP</div>
                    <div className="font-semibold text-gray-900">{item.bep}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                    <Badge variant={item.risk === "Low" ? "success" : "warning"} className="font-medium text-[10px] px-2 py-0">
                      {item.risk}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Readiness Score</div>
                    <div className="font-semibold text-green-600 flex items-center gap-1">
                      {item.score}/100
                      <TrendingUp className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-gray-900">{item.progress}% Terkumpul</span>
                    <span className="text-green-600">Est. ROI {item.roi}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0 mt-auto">
                <Button className="w-full bg-gray-950 hover:bg-gray-800 text-white">
                  Lihat Detail
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
