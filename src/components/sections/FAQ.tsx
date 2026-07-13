"use client";

import { Accordion } from "@/components/ui/accordion";
import { useLanguage } from "@/lib/language-context";

export function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    {
      id: "faq-1",
      title: t("Bagaimana sistem pembagian hasil dilakukan?", "How is the profit sharing system carried out?"),
      content: t(
        "Pembagian hasil dilakukan secara otomatis berdasarkan pencatatan transaksi dari sistem POS terintegrasi. Dana akan didistribusikan ke dompet digital masing-masing pihak (Brand Owner, Investor, Operator) sesuai dengan proporsi saham yang disepakati melalui smart contract.",
        "Profit sharing is carried out automatically based on transaction records from the integrated POS system. Funds are distributed to each party's digital wallet (Brand Owner, Investor, Operator) according to the ownership proportions agreed upon via smart contract."
      ),
    },
    {
      id: "faq-2",
      title: t("Apakah investasi di NusaArtha aman?", "Is investing in NusaArtha safe?"),
      content: t(
        "Setiap brand yang masuk ke marketplace telah melewati proses Due Diligence ketat (legalitas, kesehatan finansial, dll). Selain itu, penggunaan teknologi blockchain memastikan bahwa semua rekam data finansial bersifat immutable dan tidak bisa direkayasa.",
        "Every brand that enters the marketplace has undergone a rigorous Due Diligence process (legality, financial health, etc.). Additionally, blockchain technology ensures that all financial records are immutable and cannot be manipulated."
      ),
    },
    {
      id: "faq-3",
      title: t("Siapa yang mengelola outlet baru?", "Who manages the new outlet?"),
      content: t(
        "Outlet dapat dikelola langsung oleh tim manajemen Brand Owner atau diserahkan kepada Operator Profesional yang telah disertifikasi oleh platform kami. Hal ini ditentukan pada saat proses pendanaan awal.",
        "The outlet can be managed directly by the Brand Owner's management team or handed over to a Professional Operator certified by our platform. This is determined during the initial funding process."
      ),
    },
    {
      id: "faq-4",
      title: t("Berapa minimum pendanaan untuk investor?", "What is the minimum investment for investors?"),
      content: t(
        "Minimum investasi bervariasi tergantung pada masing-masing proyek/brand. Namun, NusaArtha menerapkan sistem urun dana (crowdfunding) sehingga nilai minimum investasi bisa sangat terjangkau, mulai dari Rp 1.000.000.",
        "The minimum investment varies depending on each project/brand. However, NusaArtha implements a crowdfunding system, making the minimum investment very affordable, starting from IDR 1,000,000."
      ),
    },
    {
      id: "faq-5",
      title: t("Bagaimana jika outlet mengalami kerugian?", "What happens if an outlet incurs losses?"),
      content: t(
        "Segala bentuk investasi mengandung risiko. Namun, platform kami memitigasi risiko tersebut dengan Readiness Assessment dan due diligence di awal, serta dashboard pemantauan kinerja real-time agar tindakan preventif bisa cepat diambil jika terjadi penurunan performa.",
        "All forms of investment carry risk. However, our platform mitigates these risks with upfront Readiness Assessment and due diligence, as well as a real-time performance monitoring dashboard so preventive action can be taken quickly if performance declines."
      ),
    },
  ];

  return (
    <section id="faq" className="py-24 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 max-w-6xl mx-auto">

          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
              {t("Pertanyaan yang Sering Diajukan", "Frequently Asked Questions")}
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              {t(
                "Temukan jawaban untuk pertanyaan umum seputar investasi, pendaftaran brand, dan operasional di ekosistem NusaArtha.",
                "Find answers to common questions about investment, brand registration, and operations in the NusaArtha ecosystem."
              )}
            </p>
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-green-900">
              <h3 className="font-semibold mb-2">{t("Masih punya pertanyaan?", "Still have questions?")}</h3>
              <p className="text-sm text-green-800 mb-4">{t("Tim support kami siap membantu Anda kapan saja.", "Our support team is ready to help you anytime.")}</p>
              <button className="text-sm font-semibold underline hover:text-green-600 transition-colors">
                {t("Hubungi Support", "Contact Support")}
              </button>
            </div>
          </div>

          <div className="lg:w-2/3">
            <Accordion items={faqs} />
          </div>

        </div>
      </div>
    </section>
  );
}
