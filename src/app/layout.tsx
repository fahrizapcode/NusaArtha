import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { StellarWalletProvider } from "@/lib/stellar/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NusaArtha - Platform Ekspansi UMKM Indonesia",
  description:
    "Percepat ekspansi bisnis Anda melalui ekosistem kemitraan yang transparan antara Brand Owner, Investor, dan Operator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <StellarWalletProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </StellarWalletProvider>
      </body>
    </html>
  );
}
