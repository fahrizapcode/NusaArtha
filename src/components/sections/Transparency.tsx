"use client";

import { motion } from "framer-motion";
import { ArrowDown, Database, PieChart, Shield, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

export function Transparency() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Database className="w-6 h-6 text-blue-400" />,
      title: "Immutable Record",
      description: t(
        "Data penjualan dari POS dicatat ke dalam blockchain dan tidak dapat diubah oleh pihak manapun.",
        "Sales data from the POS is recorded on the blockchain and cannot be altered by any party."
      ),
    },
    {
      icon: <PieChart className="w-6 h-6 text-green-400" />,
      title: "Revenue Sharing",
      description: t(
        "Smart contract mengeksekusi pembagian hasil secara otomatis berdasarkan proporsi kepemilikan.",
        "Smart contracts execute profit sharing automatically based on ownership proportions."
      ),
    },
    {
      icon: <UserCheck className="w-6 h-6 text-purple-400" />,
      title: "Ownership Record",
      description: t(
        "Bukti kepemilikan tercatat transparan dan dapat dipindahtangankan di secondary market.",
        "Ownership proof is recorded transparently and can be transferred on the secondary market."
      ),
    },
    {
      icon: <Shield className="w-6 h-6 text-yellow-400" />,
      title: "Governance",
      description: t(
        "Voting system bagi investor untuk mengambil keputusan strategis terkait operasional outlet.",
        "Voting system for investors to make strategic decisions regarding outlet operations."
      ),
    },
  ];

  return (
    <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            {t("Kepercayaan Dibangun Melalui Transparansi", "Trust Is Built Through Transparency")}
          </h2>
          <p className="text-lg text-gray-400 text-balance">
            {t(
              "NusaArtha memanfaatkan teknologi blockchain sebagai audit trail yang tidak dapat direkayasa, menjamin keamanan investasi Anda.",
              "NusaArtha leverages blockchain technology as a tamper-proof audit trail, guaranteeing the security of your investment."
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Left Column: Diagram */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 rounded-xl px-8 py-4 w-64 text-center font-semibold text-lg shadow-lg"
            >
              {t("POS Outlet", "Outlet POS")}
            </motion.div>

            <ArrowDown className="text-gray-600 animate-bounce" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-blue-900/50 border border-blue-800 rounded-xl px-8 py-4 w-64 text-center font-semibold text-lg shadow-lg text-blue-400"
            >
              {t("Platform NusaArtha", "NusaArtha Platform")}
            </motion.div>

            <ArrowDown className="text-gray-600 animate-bounce" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-green-900/50 border border-green-800 rounded-xl px-8 py-4 w-64 text-center font-semibold text-lg shadow-lg text-green-400"
            >
              Blockchain Network
            </motion.div>

            <ArrowDown className="text-gray-600 animate-bounce" />

            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-3 text-center font-semibold text-sm shadow-lg"
              >
                Audit Trail
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-3 text-center font-semibold text-sm shadow-lg"
              >
                {t("Aplikasi Investor", "Investor App")}
              </motion.div>
            </div>
          </div>

          {/* Right Column: Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/80 border-gray-800 h-full backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
