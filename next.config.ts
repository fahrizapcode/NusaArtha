import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Fix SSL certificate verification error saat connect ke Stellar Horizon testnet
// dari server-side Next.js di Windows development environment.
// JANGAN gunakan di production.
if (isDev) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
