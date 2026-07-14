// src/lib/stellar/horizon.ts
// Horizon API helpers for classic Stellar operations

import * as StellarSdk from "@stellar/stellar-sdk";
import { HORIZON_URL, STELLAR_NETWORK } from "./config";

function getServer(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(HORIZON_URL);
}

/**
 * Get account info (balances, sequence number)
 */
export async function getAccountInfo(publicKey: string) {
  try {
    const server = getServer();
    return await server.loadAccount(publicKey);
  } catch (err: any) {
    if (err.response?.status === 404) return null; // account not funded
    throw err;
  }
}

/**
 * Get XLM and custom asset balances for an account
 */
export async function getAccountBalances(
  publicKey: string
): Promise<{ asset: string; balance: string; assetCode?: string; assetIssuer?: string }[]> {
  try {
    const account = await getAccountInfo(publicKey);
    if (!account) return [];
    return account.balances.map((b: any) => ({
      asset: b.asset_type === "native" ? "XLM" : `${b.asset_code}:${b.asset_issuer}`,
      balance: b.balance,
      assetCode: b.asset_code,
      assetIssuer: b.asset_issuer,
    }));
  } catch {
    return [];
  }
}

/**
 * Fund a testnet account via Friendbot
 */
export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  if (STELLAR_NETWORK !== "TESTNET") return false;
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get recent transactions for an account
 */
export async function getAccountTransactions(publicKey: string, limit = 20) {
  try {
    const server = getServer();
    const txs = await server
      .transactions()
      .forAccount(publicKey)
      .limit(limit)
      .order("desc")
      .call();
    return txs.records;
  } catch {
    return [];
  }
}

/**
 * Get payments/transfers for an account
 */
export async function getAccountPayments(publicKey: string, limit = 20) {
  try {
    const server = getServer();
    const payments = await server
      .payments()
      .forAccount(publicKey)
      .limit(limit)
      .order("desc")
      .call();
    return payments.records;
  } catch {
    return [];
  }
}
