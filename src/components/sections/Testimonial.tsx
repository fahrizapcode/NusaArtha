"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Testimonial() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: t(
        "Berkat NusaArtha, kami bisa buka 5 cabang baru dalam 6 bulan tanpa pusing modal dan operasional. Semuanya transparan dan otomatis.",
        "Thanks to NusaArtha, we were able to open 5 new branches in 6 months without worrying about capital or operations. Everything is transparent and automated."
      ),
      author: "Budi Santoso",
      role: t("Pemilik Brand", "Brand Owner"),
      brand: "Kopi Nusantara",
      imageColor: "bg-orange-500",
    },
    {
      quote: t(
        "Sebagai investor, saya merasa tenang karena bisa pantau performa outlet secara real-time. Bagi hasil masuk otomatis tiap bulan sesuai smart contract.",
        "As an investor, I feel at ease because I can monitor outlet performance in real-time. Profit sharing is automatically distributed each month via smart contract."
      ),
      author: "Diana Putri",
      role: "Investor",
      brand: t("Portofolio Investor", "Investor Portfolio"),
      imageColor: "bg-blue-500",
    },
    {
      quote: t(
        "Platform ini sangat membantu operator di lapangan. SOP jelas, monitoring mudah, dan insentif dihitung otomatis berdasarkan performa.",
        "This platform is very helpful for field operators. SOPs are clear, monitoring is easy, and incentives are calculated automatically based on performance."
      ),
      author: "Ahmad Rizal",
      role: t("Manajer Operator", "Operator Manager"),
      brand: t("Cabang Sudirman", "Sudirman Branch"),
      imageColor: "bg-green-500",
    },
  ];

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
            <Quote className="absolute top-8 right-12 w-16 h-16 text-gray-100 rotate-180" />

            <div className="overflow-hidden min-h-[250px] flex items-center relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <p className="text-xl md:text-3xl font-medium text-gray-900 leading-relaxed mb-8 text-balance">
                    "{testimonials[currentIndex].quote}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${testimonials[currentIndex].imageColor} flex items-center justify-center text-white font-semibold text-xl`}>
                      {testimonials[currentIndex].author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-950">{testimonials[currentIndex].author}</div>
                      <div className="text-sm text-gray-500">
                        {testimonials[currentIndex].role} &middot; {testimonials[currentIndex].brand}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="ml-auto flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-green-600" : "w-2 bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
