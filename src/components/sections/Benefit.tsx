"use client";

import { Tabs } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Benefit() {
  const { t } = useLanguage();

  const brandBenefits = [
    t("Skala bisnis lebih cepat tanpa pusing capex.", "Scale your business faster without worrying about capex."),
    t("Bebas dari urusan operasional harian cabang baru.", "Free from daily operational tasks of new branches."),
    t("Sistem kasir dan pelaporan yang sudah disediakan.", "POS and reporting systems already provided."),
    t("Distribusi hasil yang otomatis dan transparan.", "Automatic and transparent profit distribution."),
  ];

  const investorBenefits = [
    t("Akses investasi ke bisnis real yang sudah terbukti.", "Investment access to proven real businesses."),
    t("Transparansi laporan penjualan harian secara real-time.", "Real-time transparency on daily sales reports."),
    t("Bagi hasil otomatis tanpa perlu menagih.", "Automatic profit sharing without manual collection."),
    t("Risiko terukur melalui proses Due Diligence ketat.", "Measurable risk through rigorous due diligence."),
  ];

  const operatorBenefits = [
    t("Fokus penuh pada pelayanan dan kualitas produk.", "Full focus on service and product quality."),
    t("Panduan SOP yang jelas dan terstruktur.", "Clear and structured SOP guidelines."),
    t("Insentif performa berdasarkan pencapaian target.", "Performance incentives based on target achievement."),
    t("Dukungan sistem teknologi untuk kelancaran operasional.", "Technology system support for smooth operations."),
  ];

  const renderBenefitCard = (benefits: string[], title: string, description: string) => (
    <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <div>
        <h3 className="text-2xl font-semibold text-gray-950 mb-4">{title}</h3>
        <p className="text-gray-500 mb-8">{description}</p>
        <ul className="space-y-4">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl overflow-hidden bg-gray-100 h-64 md:h-full min-h-[300px] relative border border-gray-200 flex items-center justify-center">
        <div className="text-gray-400 font-medium">Dashboard Preview - {title}</div>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
            {t("Dirancang untuk Kesuksesan Bersama", "Designed for Shared Success")}
          </h2>
          <p className="text-lg text-gray-500 text-balance">
            {t(
              "Platform kami memberikan nilai tambah spesifik bagi setiap pihak yang terlibat dalam ekosistem kemitraan.",
              "Our platform delivers specific value for every party involved in the partnership ecosystem."
            )}
          </p>
        </div>

        <Tabs
          defaultValue="brand"
          tabs={[
            {
              id: "brand",
              label: "Brand Owner",
              content: renderBenefitCard(
                brandBenefits,
                t("Ekspansi Tanpa Batas, Tanpa Modal Besar", "Limitless Expansion, Without Large Capital"),
                t(
                  "Fokuskan energi Anda pada pengembangan produk dan strategi brand, biarkan ekosistem kami menangani pendanaan dan operasional cabang baru.",
                  "Focus your energy on product development and brand strategy, let our ecosystem handle funding and operations of new branches."
                )
              ),
            },
            {
              id: "investor",
              label: "Investor",
              content: renderBenefitCard(
                investorBenefits,
                t("Passive Income yang Dapat Diverifikasi", "Verifiable Passive Income"),
                t(
                  "Tinggalkan era investasi bodong. Pantau performa investasi Anda detik demi detik dengan data riil dari sistem kasir di lapangan.",
                  "Leave the era of fraudulent investments. Monitor your investment performance second by second with real data from on-site POS systems."
                )
              ),
            },
            {
              id: "operator",
              label: "Operator",
              content: renderBenefitCard(
                operatorBenefits,
                t("Fokus Eksekusi dan Maksimalkan Pelayanan", "Focus on Execution and Maximize Service"),
                t(
                  "Jalankan operasional dengan tenang menggunakan SOP teruji dan dukungan teknologi mutakhir, serta nikmati insentif atas kinerja yang baik.",
                  "Run operations confidently with proven SOPs and cutting-edge technology support, and enjoy incentives for good performance."
                )
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
