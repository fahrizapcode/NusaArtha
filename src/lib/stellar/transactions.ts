// src/lib/stellar/transactions.ts
// Token purchase & revenue distribution via Stellar Payment operations

import {
  Asset,
  Keypair,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Memo,
} from "@stellar/stellar-sdk";
import { getHorizonServer, getStellarConfig } from "./network";
import { signTransactionWithFreighter } from "./wallet";
import { getPoolAsset, getPlatformIssuer } from "./assets";

export type PurchaseTokenResult = {
  txHash: string;
  success: boolean;
  error?: string;
  explorerUrl?: string;
};

/**
 * Investor purchases pool tokens.
 * Flow:
 *  1. Investor must already have a trustline (see establishTrustline)
 *  2. Platform issues tokens to investor via payment from issuer
 *  3. Investor sends XLM payment to platform treasury
 *
 * For MVP, this creates a Stellar transaction:
 *  - Payment: platform_issuer → investor_wallet  (pool tokens)
 *
 * In production, the XLM side payment would be handled separately
 * or via a path payment / DEX order.
 */
export async function purchasePoolTokens(
  investorPublicKey: string,
  poolId: string,
  tokenAmount: number,
  memoText?: string
): Promise<PurchaseTokenResult> {
  try {
    const { networkPassphrase, network } = getStellarConfig();
    const server = getHorizonServer();
    const issuer = getPlatformIssuer();

    if (!issuer) {
      return {
        txHash: "",
        success: false,
        error: "Platform issuer key tidak dikonfigurasi. Hubungi admin.",
      };
    }

    const asset = getPoolAsset(poolId);

    // Load investor account
    const account = await server.loadAccount(investorPublicKey);

    // Build transaction: platform sends pool tokens to investor
    const tx = new TransactionBuilder(account, {
      fee: (parseInt(BASE_FEE) * 2).toString(),
      networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: investorPublicKey,
          asset,
          amount: tokenAmount.toFixed(7),
          source: issuer, // platform issuer signs on server side
        })
      )
      .addMemo(
        memoText
          ? Memo.text(memoText.slice(0, 28))
          : Memo.text(`POOL:${poolId.slice(0, 10)}`)
      )
      .setTimeout(60)
      .build();

    // Investor signs with Freighter
    const signedXdr = await signTransactionWithFreighter(
      tx.toXDR(),
      networkPassphrase
    );
    if (!signedXdr) {
      return { txHash: "", success: false, error: "Transaksi dibatalkan pengguna" };
    }

    // Submit to Horizon
    const result = await server.submitTransaction(
      TransactionBuilder.fromXDR(signedXdr, networkPassphrase) as any
    );
    const hash = (result as any).hash;
    const explorerBase =
      network === "mainnet"
        ? "https://stellar.expert/explorer/public/tx"
        : "https://stellar.expert/explorer/testnet/tx";

    return {
      txHash: hash,
      success: true,
      explorerUrl: `${explorerBase}/${hash}`,
    };
  } catch (err: any) {
    const resultCodes =
      err?.response?.data?.extras?.result_codes;
    const detail = resultCodes
      ? JSON.stringify(resultCodes)
      : err?.message || String(err);
    console.error("[Stellar] purchasePoolTokens error:", detail);
    return { txHash: "", success: false, error: detail };
  }
}

/**
 * Server-side: Platform distributes revenue to investors via Stellar payments.
 * Called from a server action / API route using platform secret key.
 * Each investor receives their share proportionally to token holdings.
 */
export async function distributeRevenue(
  distributions: Array<{
    investorPublicKey: string;
    amountXLM: string; // in XLM
  }>,
  poolId: string,
  memo?: string
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const { networkPassphrase } = getStellarConfig();
    const server = getHorizonServer();

    const secretKey = process.env.STELLAR_PLATFORM_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STELLAR_PLATFORM_SECRET_KEY not configured");
    }

    const platformKeypair = Keypair.fromSecret(secretKey);
    const platformAccount = await server.loadAccount(
      platformKeypair.publicKey()
    );

    const txBuilder = new TransactionBuilder(platformAccount, {
      fee: (parseInt(BASE_FEE) * (distributions.length + 1)).toString(),
      networkPassphrase,
    });

    for (const dist of distributions) {
      txBuilder.addOperation(
        Operation.payment({
          destination: dist.investorPublicKey,
          asset: Asset.native(), // XLM revenue distribution
          amount: parseFloat(dist.amountXLM).toFixed(7),
        })
      );
    }

    if (memo) txBuilder.addMemo(Memo.text(memo.slice(0, 28)));
    txBuilder.setTimeout(30);

    const tx = txBuilder.build();
    tx.sign(platformKeypair);

    const result = await server.submitTransaction(tx);
    return { txHash: (result as any).hash, success: true };
  } catch (err: any) {
    console.error("[Stellar] distributeRevenue error:", err);
    return { txHash: "", success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetches the last N transactions for a Stellar account
 */
export async function getAccountTransactions(
  publicKey: string,
  limit = 20
): Promise<any[]> {
  try {
    const server = getHorizonServer();
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
 * Fetches payment operations for an account (revenue history)
 */
export async function getPaymentHistory(
  publicKey: string,
  limit = 50
): Promise<any[]> {
  try {
    const server = getHorizonServer();
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
