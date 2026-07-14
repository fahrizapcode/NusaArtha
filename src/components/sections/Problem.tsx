"use client";

import { motion } from "framer-motion";
import { Wallet, EyeOff, Settings, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

export function Problem() {
  const { t } = useLanguage();

  const problems = [
    {
      icon: <Wallet className="w-6 h-6 text-red-500" />,
      title: t("Sulit Mendapat Pendanaan", "Hard to Secure Funding"),
      description: t(
        "UMKM sering kesulitan mengakses modal ekspansi dari institusi keuangan tradisional karena persyaratan agunan yang ketat.",
        "SMEs often struggle to access expansion capital from traditional financial institutions due to strict collateral requirements."
      ),
    },
    {
      icon: <EyeOff className="w-6 h-6 text-orange-500" />,
      title: t("Kurangnya Transparansi", "Lack of Transparency"),
      description: t(
        "Investor ragu untuk mendanai karena tidak ada laporan keuangan dan operasional yang dapat dipercaya dan diverifikasi.",
        "Investors hesitate to fund because there are no reliable and verifiable financial and operational reports."
      ),
    },
    {
      icon: <Settings className="w-6 h-6 text-purple-500" />,
      title: t("Operasional Sulit Dikontrol", "Hard to Control Operations"),
      description: t(
        "Pemilik brand kesulitan memonitor performa banyak cabang sekaligus, memicu kebocoran revenue dan inefisiensi.",
        "Brand owners struggle to monitor performance across multiple branches, leading to revenue leakage and inefficiency."
      ),
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-blue-500" />,
      title: t("Brand Sulit Berkembang", "Brands Struggle to Scale"),
      description: t(
        "Tanpa ekosistem pendukung, banyak brand potensial yang terjebak pada 1-2 outlet dan gagal melakukan penetrasi pasar.",
        "Without a supporting ecosystem, many potential brands are stuck at 1-2 outlets and fail to penetrate the market."
      ),
    },
  ];

  return (
    <section id="solusi" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
            {t("Mengapa Ekspansi UMKM Masih Sulit?", "Why Is SME Expansion Still So Hard?")}
          </h2>
          <p className="text-lg text-gray-500 text-balance">
            {t(
              "Model bisnis tradisional dan kemitraan konvensional memiliki banyak celah yang menghambat pertumbuhan brand potensial.",
              "Traditional business models and conventional partnerships have many gaps that hinder the growth of potential brands."
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-start"
          >
            <img 
              src="/problem-illustration.png" 
              alt="Problem Illustration" 
              className="w-full max-w-md lg:max-w-full h-auto object-contain" 
            />
          </motion.div>

          {/* Right Side: Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                      {item.icon}
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
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
