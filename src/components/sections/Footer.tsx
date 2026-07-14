"use client";

import { Mail, Phone, Globe, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">

          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="NusaArtha Logo" className="h-8 w-auto" />
            </div>
            <p className="text-gray-500 mb-6 max-w-sm">
              {t(
                "Platform ekspansi UMKM berbasis kemitraan yang transparan. Membangun masa depan bisnis kuliner dan retail Indonesia dengan teknologi blockchain.",
                "Transparent partnership-based SME expansion platform. Building the future of Indonesia's food and retail business with blockchain technology."
              )}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="mailto:hello@nusaartha.id" className="text-gray-400 hover:text-green-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="tel:+6221000000" className="text-gray-400 hover:text-green-600 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#tentang" className="text-gray-400 hover:text-green-600 transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-950 mb-4">{t("Perusahaan", "Company")}</h4>
            <ul className="space-y-3">
              <li><a href="#tentang" className="text-gray-500 hover:text-green-600 transition-colors">{t("Tentang Kami", "About Us")}</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors">{t("Karir", "Careers")}</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Press Kit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-950 mb-4">{t("Platform", "Platform")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/investor/dashboard/marketplace" className="text-gray-500 hover:text-green-600 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/register-brand" className="text-gray-500 hover:text-green-600 transition-colors">
                  Brand Owner
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-500 hover:text-green-600 transition-colors">
                  Investor
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-500 hover:text-green-600 transition-colors">
                  Operator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-950 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors">{t("Syarat & Ketentuan", "Terms & Conditions")}</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors">{t("Kebijakan Privasi", "Privacy Policy")}</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors">{t("Peringatan Risiko", "Risk Disclaimer")}</a></li>
              <li><a href="mailto:hello@nusaartha.id" className="text-gray-500 hover:text-green-600 transition-colors">{t("Kontak", "Contact")}</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} NusaArtha. {t("Seluruh hak cipta dilindungi.", "All rights reserved.")}
          </p>
          <div className="text-gray-400 text-sm flex gap-4">
            <span>Indonesia</span>
            <span>IDR (Rp)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
