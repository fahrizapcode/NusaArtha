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
  const [activeSection, setActiveSection] = useState("");
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds = ["beranda", "solusi", "cara-kerja", "marketplace", "tentang", "faq"];
      let current = "";
      for (const section of sectionIds) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust threshold based on header height
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

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
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    isActive ? "text-green-600" : "text-gray-600 hover:text-green-600"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 inset-x-0 mx-auto w-[5px] h-[5px] bg-green-600 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <Button variant="outline" className="font-semibold" onClick={() => window.location.href = '/login'}>
              {t("Masuk", "Sign In")}
            </Button>
            <Button className="font-semibold" onClick={() => window.location.href = '/register-brand'}>
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
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className={cn(
                      "text-base font-medium py-2 border-b border-gray-50 last:border-0 flex items-center justify-between",
                      isActive ? "text-green-600" : "text-gray-900"
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <div className="w-[5px] h-[5px] bg-green-600 rounded-full" />
                    )}
                  </a>
                );
              })}
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="outline" className="w-full justify-center" onClick={() => window.location.href = '/login'}>
                  {t("Masuk", "Sign In")}
                </Button>
                <Button className="w-full justify-center" onClick={() => window.location.href = '/register-brand'}>
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
