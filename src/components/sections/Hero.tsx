"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";


export function Hero() {
  const { language, t } = useLanguage();

  return (
    <section id="beranda" className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >

            <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold tracking-tight text-gray-950 text-balance leading-[1.1]">
              {language === "id" ? (
                <>Percepat Ekspansi Bisnis Melalui Ekosistem Kemitraan yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Transparan</span></>
              ) : (
                <>Accelerate Business Expansion Through a <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Transparent</span> Partnership Ecosystem</>
              )}
            </h1>

            <p className="text-lg text-gray-600 text-balance max-w-xl">
              {t(
                "Hubungkan Brand Owner, Investor, dan Operator Outlet dalam satu platform. Skalakan bisnis kuliner dan retail Anda dengan pendanaan dan operasional yang terukur.",
                "Connect Brand Owners, Investors, and Outlet Operators in one platform. Scale your food & retail business with measurable funding and operations."
              )}
            </p>


            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/register-brand">
                <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-green-600/20">
                  {t("Daftarkan Brand", "Register Brand")}
                </Button>
              </Link>
              <Link href="/investor/dashboard/marketplace">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  {t("Jelajahi Marketplace", "Explore Marketplace")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 mt-4 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-gray-950">120+</span>
                <span className="text-sm font-medium text-gray-500">Brand</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-gray-950">250+</span>
                <span className="text-sm font-medium text-gray-500">Outlet</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-green-600">Rp8,4M+</span>
                <span className="text-sm font-medium text-gray-500">{t("Pendanaan", "Funding")}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold text-gray-950">1.800+</span>
                <span className="text-sm font-medium text-gray-500">Investor</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:ml-10 flex justify-center"
          >
            <img
              src="/landing-page-illustration.png"
              alt="NusaArtha Illustration"
              className="w-full max-w-[600px] h-auto object-contain"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
