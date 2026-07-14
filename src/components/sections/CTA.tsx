"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

export function CTA() {
  const { t } = useLanguage();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-blue-800" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6 text-balance leading-tight">
            {t(
              "Siap Mengembangkan Bisnis Bersama Ekosistem yang Tepat?",
              "Ready to Grow Your Business with the Right Ecosystem?"
            )}
          </h2>
          <p className="text-lg md:text-xl text-green-50 mb-10 text-balance max-w-2xl mx-auto">
            {t(
              "Bergabunglah sekarang. Daftarkan brand Anda untuk berekspansi, atau mulai investasi di bisnis riil dengan keamanan teknologi blockchain.",
              "Join now. Register your brand for expansion, or start investing in real businesses secured by blockchain technology."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register-brand">
              <Button size="lg" className="h-14 px-8 text-base bg-white text-green-700 hover:bg-gray-50 shadow-lg shadow-black/10 font-semibold">
                {t("Daftarkan Brand", "Register Brand")}
              </Button>
            </Link>
            <Link href="/investor/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold">
                {t("Gabung Sebagai Investor", "Join as Investor")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
