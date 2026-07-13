"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Solution() {
  const { t } = useLanguage();

  const steps = [
    {
      title: "Brand Onboarding",
      description: t("Pendaftaran brand dan pengumpulan data historis.", "Brand registration and historical data collection."),
    },
    {
      title: "Brand Assessment",
      description: t("Evaluasi kesiapan ekspansi menggunakan scoring AI.", "Expansion readiness evaluation using AI scoring."),
    },
    {
      title: "Due Diligence",
      description: t("Verifikasi legal, finansial, dan kelayakan lokasi.", "Legal, financial, and location feasibility verification."),
    },
    {
      title: "Investment Pool",
      description: t("Listing di marketplace untuk penggalangan dana.", "Listed on the marketplace for fundraising."),
    },
    {
      title: t("Pendanaan", "Funding"),
      description: t("Pengumpulan dana dari investor secara aman.", "Secure collection of funds from investors."),
    },
    {
      title: t("Pembukaan Outlet", "Outlet Opening"),
      description: t("Proses setup dan handover ke operator.", "Setup process and handover to the operator."),
    },
    {
      title: "Monitoring POS",
      description: t("Integrasi sistem kasir untuk tracking revenue real-time.", "POS integration for real-time revenue tracking."),
    },
    {
      title: "Revenue Sharing",
      description: t("Distribusi hasil secara otomatis dan transparan.", "Automatic and transparent profit distribution."),
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
            {t("Satu Platform untuk Seluruh Siklus Ekspansi", "One Platform for the Entire Expansion Cycle")}
          </h2>
          <p className="text-lg text-gray-500 text-balance">
            {t(
              "NusaArtha memfasilitasi setiap langkah dari persiapan hingga bagi hasil, memastikan keamanan bagi seluruh pihak.",
              "NusaArtha facilitates every step from preparation to profit sharing, ensuring security for all parties."
            )}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line for desktop */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 -translate-x-1/2 hidden md:block" />

          <div className="space-y-4 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center gap-4 md:gap-8 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Connector on desktop */}
                <div className="hidden md:flex flex-1 w-full justify-end" />

                {/* Center Node */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-green-500 z-10 flex items-center justify-center shadow-sm hidden md:flex">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>

                {/* Content Card */}
                <div className="flex-1 w-full relative z-10">
                  <div className={`p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow relative ${
                    index % 2 === 0 ? "md:text-right md:mr-8" : "md:text-left md:ml-8"
                  }`}>
                    <div className="text-sm font-semibold text-green-600 mb-1">{t("Tahap", "Step")} {index + 1}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm">{step.description}</p>

                    {/* Mobile connector */}
                    {index < steps.length - 1 && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:hidden">
                        <ArrowDown className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
