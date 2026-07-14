// src/lib/stellar/config.ts
// Stellar network configuration

export const STELLAR_NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET") as
  | "TESTNET"
  | "MAINNET";

export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

export const FACTORY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || "";

export const GOVERNANCE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID || "";

export const AUDIT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_AUDIT_CONTRACT_ID || "";

// Horizon (for classic Stellar ops like account info, asset balances)
export const HORIZON_URL =
  STELLAR_NETWORK === "MAINNET"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

export const FREIGHTER_DOWNLOAD_URL =
  "https://www.freighter.app/";
