"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

const partners = [
  { name: "Bank Mandiri", logo: "Mandiri" },
  { name: "BCA", logo: "BCA" },
  { name: "Gojek", logo: "Gojek" },
  { name: "Grab", logo: "Grab" },
  { name: "OVO", logo: "OVO" },
  { name: "Dana", logo: "Dana" },
];

export function Partner() {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-widest">
          {t("Dipercaya oleh ekosistem terkemuka", "Trusted by leading ecosystems")}
        </p>

        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tighter"
            >
              {partner.logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
