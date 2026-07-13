"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldAlert, Store, Activity, Link, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export function Feature() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Brand Readiness Assessment",
      description: t(
        "Evaluasi berbasis data untuk menilai kelayakan ekspansi suatu brand berdasarkan historis penjualan dan operasional.",
        "Data-driven evaluation to assess a brand's expansion feasibility based on sales history and operations."
      ),
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Due Diligence",
      description: t(
        "Pemeriksaan menyeluruh terhadap aspek legalitas, kelayakan lokasi, dan proyeksi finansial outlet baru.",
        "Comprehensive review of legal aspects, location feasibility, and financial projections for new outlets."
      ),
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: t("Marketplace Investasi", "Investment Marketplace"),
      description: t(
        "Platform untuk mempertemukan brand yang butuh pendanaan dengan investor ritel maupun institusi.",
        "A platform connecting brands that need funding with retail and institutional investors."
      ),
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: t("POS Terintegrasi", "Integrated POS"),
      description: t(
        "Sistem kasir cerdas yang secara otomatis mencatat dan melaporkan setiap transaksi ke dalam ekosistem.",
        "Smart POS system that automatically records and reports every transaction within the ecosystem."
      ),
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Operator Performance",
      description: t(
        "Dashboard monitoring untuk mengevaluasi kinerja tim operasional harian di masing-masing cabang.",
        "Monitoring dashboard to evaluate daily operational team performance at each branch."
      ),
    },
    {
      icon: <Link className="w-6 h-6" />,
      title: "Blockchain Transparency",
      description: t(
        "Pencatatan distribusi dana dan pembagian hasil yang terekam secara immutable pada jaringan blockchain.",
        "Fund distribution and profit sharing recorded immutably on the blockchain network."
      ),
    },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
            {t("Fitur Utama Platform", "Core Platform Features")}
          </h2>
          <p className="text-lg text-gray-500 text-balance">
            {t(
              "Dibangun dengan teknologi modern untuk menghadirkan skalabilitas dan transparansi pada tingkat enterprise.",
              "Built with modern technology to deliver enterprise-grade scalability and transparency."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                {feature.description}
              </p>
              <Button variant="ghost" className="w-fit p-0 hover:bg-transparent text-green-600 hover:text-green-700 font-semibold h-auto">
                {t("Pelajari selengkapnya", "Learn more")} &rarr;
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
