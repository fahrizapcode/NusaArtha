// src/lib/stellar/assets.ts
// Stellar Asset (token) operations
// Each InvestmentPool gets its own custom Stellar Asset (e.g. POOL001:GABC...)

import * as StellarSdk from "@stellar/stellar-sdk";
import { getHorizonServer, getStellarConfig } from "./network";
import { signTransactionWithFreighter } from "./wallet";

export type PoolAsset = {
  code: string;
  issuer: string;
};

// Convenience alias for the SDK balance union type
type BalanceLine = StellarSdk.Horizon.HorizonApi.BalanceLine;
type BalanceLineAsset = StellarSdk.Horizon.HorizonApi.BalanceLineAsset;

function isNonNativeBalance(b: BalanceLine): b is BalanceLineAsset {
  return b.asset_type !== "native" && b.asset_type !== "liquidity_pool_shares";
}

function normalizeAssetCode(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function matchesPoolAsset(balance: BalanceLine, poolId: string): boolean {
  if (!isNonNativeBalance(balance)) return false;
  const expectedCode = normalizeAssetCode(poolIdToAssetCode(poolId));
  const actualCode = normalizeAssetCode(balance.asset_code || "");
  if (!expectedCode || !actualCode) return false;
  return (
    actualCode === expectedCode ||
    actualCode.includes(expectedCode) ||
    expectedCode.includes(actualCode)
  );
}

/**
 * Derives a deterministic Stellar asset code from a pool ID (max 12 chars alphanumeric)
 */
export function poolIdToAssetCode(poolId: string): string {
  const cleaned = normalizeAssetCode(poolId);
  return cleaned.slice(0, 12) || "NAPOOL";
}

/**
 * Gets the platform issuer public key from env
 */
export function getPlatformIssuer(): string {
  return (
    process.env.NEXT_PUBLIC_PLATFORM_ISSUER_KEY ||
    process.env.STELLAR_PLATFORM_PUBLIC_KEY ||
    ""
  );
}

/**
 * Creates a Stellar Asset object for a pool
 */
export function getPoolAsset(poolId: string): StellarSdk.Asset {
  const code = poolIdToAssetCode(poolId);
  const issuer = getPlatformIssuer();
  if (!issuer) {
    throw new Error("Platform issuer key not configured in env");
  }
  return new StellarSdk.Asset(code, issuer);
}

/**
 * Establishes a trustline for an investor to hold pool tokens.
 */
export async function establishTrustline(
  investorPublicKey: string,
  poolId: string,
  networkPassphrase?: string | null,
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const { networkPassphrase: configPassphrase } = getStellarConfig();
    const passphrase = networkPassphrase || configPassphrase;

    const issuer = getPlatformIssuer();
    if (!issuer) {
      return {
        txHash: "",
        success: false,
        error:
          "Platform issuer key belum dikonfigurasi. Isi NEXT_PUBLIC_PLATFORM_ISSUER_KEY di .env.local lalu restart server.",
      };
    }

    const server = getHorizonServer();
    const asset = getPoolAsset(poolId);

    const account = await server.loadAccount(investorPublicKey);
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: passphrase,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset,
          limit: "1000000000",
        }),
      )
      .setTimeout(60)
      .build();

    const signedXdr = await signTransactionWithFreighter(
      tx.toXDR(),
      passphrase,
    );
    if (!signedXdr) {
      return {
        txHash: "",
        success: false,
        error:
          "Freighter tidak mengembalikan transaksi yang ditandatangani. " +
          "Pastikan Freighter terbuka, tidak terkunci, dan network-nya TESTNET.",
      };
    }

    const result = await server.submitTransaction(
      StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        passphrase,
      ) as StellarSdk.Transaction,
    );
    return { txHash: (result as { hash: string }).hash, success: true };
  } catch (err: unknown) {
    const e = err as { response?: { data?: { extras?: { result_codes?: unknown } } }; message?: string };
    const resultCodes = e?.response?.data?.extras?.result_codes;
    const detail = resultCodes
      ? JSON.stringify(resultCodes)
      : e?.message || String(err);
    console.error("[Stellar] establishTrustline error:", detail);
    return { txHash: "", success: false, error: detail };
  }
}

/**
 * Checks if an account already has a trustline for a pool asset
 */
export async function hasTrustline(
  publicKey: string,
  poolId: string,
): Promise<boolean> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    return account.balances.some((b) => matchesPoolAsset(b, poolId));
  } catch {
    return false;
  }
}

/**
 * Gets the token balance for an investor in a pool
 */
export async function getTokenBalance(
  publicKey: string,
  poolId: string,
): Promise<number> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    const matches = account.balances.filter((b) => matchesPoolAsset(b, poolId));
    if (matches.length === 0) return 0;
    return matches.reduce(
      (total, b) => total + parseFloat(b.balance || "0"),
      0,
    );
  } catch {
    return 0;
  }
}

/**
 * Gets the XLM (native) balance of an account
 */
export async function getNativeBalance(publicKey: string): Promise<number> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? parseFloat(native.balance) : 0;
  } catch {
    return 0;
  }
}

/**
 * Fetches all pool token balances for a wallet
 */
export async function getAllPoolBalances(
  publicKey: string,
): Promise<Array<{ assetCode: string; issuer: string; balance: number }>> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    return account.balances
      .filter(isNonNativeBalance)
      .map((b) => ({
        assetCode: b.asset_code,
        issuer: b.asset_issuer,
        balance: parseFloat(b.balance),
      }));
  } catch {
    return [];
  }
}

/**
 * Returns the Stellar Expert URL for a pool asset
 */
export function getAssetExplorerUrl(poolId: string): string {
  try {
    const asset = getPoolAsset(poolId);
    const { network } = getStellarConfig();
    const base =
      network === "mainnet"
        ? "https://stellar.expert/explorer/public"
        : "https://stellar.expert/explorer/testnet";
    return `${base}/asset/${asset.code}-${asset.issuer}`;
  } catch {
    return "";
  }
}
