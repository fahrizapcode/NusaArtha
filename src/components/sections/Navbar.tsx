"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("Beranda", "Home"), href: "#beranda" },
    { name: t("Solusi", "Solution"), href: "#solusi" },
    { name: t("Cara Kerja", "How It Works"), href: "#cara-kerja" },
    { name: t("Marketplace", "Marketplace"), href: "#marketplace" },
    { name: t("Tentang", "About"), href: "#tentang" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="NusaArtha Logo" className="h-8 w-auto" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <Button variant="outline" className="font-semibold">
              {t("Masuk", "Sign In")}
            </Button>
            <Button className="font-semibold">
              {t("Daftarkan Brand", "Register Brand")}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <button
              className="p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-gray-900 py-2 border-b border-gray-50 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="outline" className="w-full justify-center">
                  {t("Masuk", "Sign In")}
                </Button>
                <Button className="w-full justify-center">
                  {t("Daftarkan Brand", "Register Brand")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Language Switcher Component ──────────────────────────────────────────────

function LanguageSwitcher({
  language,
  setLanguage,
}: {
  language: "id" | "en";
  setLanguage: (lang: "id" | "en") => void;
}) {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
      <button
        onClick={() => setLanguage("id")}
        className={cn(
          "relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none",
          language === "id"
            ? "text-white"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        {language === "id" && (
          <motion.span
            layoutId="lang-pill"
            className="absolute inset-0 bg-green-600 rounded-full"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">🇮🇩 ID</span>
      </button>

      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none",
          language === "en"
            ? "text-white"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        {language === "en" && (
          <motion.span
            layoutId="lang-pill"
            className="absolute inset-0 bg-green-600 rounded-full"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">🇬🇧 EN</span>
      </button>
    </div>
  );
}
