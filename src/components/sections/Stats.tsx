"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

function Counter({ value, isCurrency }: { value: number; isCurrency?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = value > 1000 ? 2000 : 1500;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const displayValue = isCurrency
    ? (count / 1000).toFixed(1).replace(".0", "")
    : count;

  return <span>{displayValue}</span>;
}

export function Stats() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { label: t("Dana Terkumpul", "Funds Raised"), value: 8400, prefix: "Rp", suffix: "M+", isCurrency: true },
    { label: t("Outlet Dibuka", "Outlets Opened"), value: 250, suffix: "+" },
    { label: t("Keberhasilan Pendanaan", "Funding Success Rate"), value: 98, suffix: "%" },
    { label: t("Kepuasan Investor", "Investor Satisfaction"), value: 99, suffix: "%" },
  ];

  return (
    <section className="py-20 bg-green-600 text-white relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onViewportEnter={() => setIsVisible(true)}
        >
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter">
                {stat.prefix}
                {isVisible ? <Counter value={stat.value} isCurrency={stat.isCurrency} /> : "0"}
                {stat.suffix}
              </div>
              <div className="text-green-100 font-medium text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
