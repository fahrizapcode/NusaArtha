"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Store, Server, LineChart, Briefcase } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function HowItWorks() {
  const { t } = useLanguage();

  const stakeholders = [
    {
      icon: <Store className="w-8 h-8 text-green-600" />,
      title: t("Pemilik Brand", "Brand Owner"),
      description: t(
        "Fokus pada inovasi produk dan standar kualitas, sambil mengembangkan sayap bisnis tanpa pusing memikirkan capex dan operasional harian outlet baru.",
        "Focus on product innovation and quality standards, while expanding your business without worrying about capex and daily operations of new outlets."
      ),
      color: "bg-green-50 border-green-100",
    },
    {
      icon: <Server className="w-8 h-8 text-blue-600" />,
      title: t("Platform", "Platform"),
      description: t(
        "Menyediakan infrastruktur digital, smart contract, POS terintegrasi, serta sistem auto-distribution untuk menjaga kepercayaan antar pihak.",
        "Provides digital infrastructure, smart contracts, integrated POS, and auto-distribution system to maintain trust between all parties."
      ),
      color: "bg-blue-50 border-blue-100",
    },
    {
      icon: <LineChart className="w-8 h-8 text-purple-600" />,
      title: "Investor",
      description: t(
        "Memilih dan mendanai brand potensial dengan data historis yang valid. Menikmati passive income dengan tingkat transparansi tertinggi.",
        "Choose and fund potential brands with valid historical data. Enjoy passive income with the highest level of transparency."
      ),
      color: "bg-purple-50 border-purple-100",
    },
    {
      icon: <Briefcase className="w-8 h-8 text-orange-600" />,
      title: "Operator",
      description: t(
        "Menjalankan operasional outlet harian sesuai SOP, memantau ketersediaan stok, dan memastikan pelayanan pelanggan tetap prima.",
        "Run daily outlet operations according to SOPs, monitor stock availability, and ensure excellent customer service."
      ),
      color: "bg-orange-50 border-orange-100",
    },
  ];

  return (
    <section id="cara-kerja" className="py-24 bg-gray-950 text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white">
            {t("Cara Kerja Ekosistem", "How the Ecosystem Works")}
          </h2>
          <p className="text-lg text-gray-400 text-balance">
            {t(
              "Sinergi empat pilar utama untuk menciptakan pertumbuhan bisnis yang berkelanjutan dan saling menguntungkan.",
              "Synergy of four main pillars to create sustainable and mutually beneficial business growth."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stakeholders.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:bg-gray-800/80 transition-colors flex flex-col h-full"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 border ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                {item.description}
              </p>
              <Button variant="outline" className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white">
                {t("Pelajari", "Learn More")}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
