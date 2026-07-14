// src/lib/stellar/audit.ts
// Audit trail using Stellar transaction memos + IPFS for full data
// Every significant platform event is anchored on Stellar as an immutable record

import {
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Memo,
  Keypair,
} from "@stellar/stellar-sdk";
import { getHorizonServer, getStellarConfig, getStellarExpertUrl } from "./network";
import { uploadJSONToIPFS } from "@/lib/ipfs";

export type AuditEventType =
  | "BRAND_APPROVED"
  | "BRAND_REJECTED"
  | "POOL_PUBLISHED"
  | "INVESTMENT_MADE"
  | "REVENUE_DISTRIBUTED"
  | "GOVERNANCE_VOTE"
  | "GOVERNANCE_EXECUTED"
  | "OUTLET_STATUS_CHANGED"
  | "KYC_VERIFIED";

export type AuditEntry = {
  poolId: string;
  eventType: AuditEventType;
  dataCID: string;         // IPFS CID for full event data
  txHash: string;
  timestamp: Date;
  recorder: string;        // Stellar public key of recorder
};

/**
 * Server-side: Records an audit event on Stellar.
 * Uploads event data to IPFS, then sends a Stellar transaction
 * with the IPFS CID in the memo.
 */
export async function recordAuditEvent(
  eventType: AuditEventType,
  poolId: string,
  eventData: object
): Promise<{ txHash: string; cid: string; success: boolean }> {
  try {
    const secretKey = process.env.STELLAR_PLATFORM_SECRET_KEY;
    if (!secretKey) {
      console.warn("[Audit] No STELLAR_PLATFORM_SECRET_KEY. Skipping on-chain log.");
      return { txHash: "", cid: "", success: false };
    }

    const { networkPassphrase } = getStellarConfig();
    const server = getHorizonServer();
    const platformKeypair = Keypair.fromSecret(secretKey);

    // 1. Upload full event data to IPFS
    const cid = await uploadJSONToIPFS(
      {
        poolId,
        eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
        recorder: platformKeypair.publicKey(),
      },
      `audit-${eventType}-${poolId}-${Date.now()}`
    );

    // 2. Build memo: "TYPE:CID_PREFIX" (max 28 chars)
    const cidShort = cid.slice(0, 20);
    const memoText = `${eventType.slice(0, 6)}:${cidShort}`.slice(0, 28);

    // 3. Submit a minimal transaction (0 XLM self-payment to record)
    const account = await server.loadAccount(platformKeypair.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `AUDIT:${poolId}`.slice(0, 64),
          value: Buffer.from(`${eventType}:${cid.slice(0, 50)}`),
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(30)
      .build();

    tx.sign(platformKeypair);
    const result = await server.submitTransaction(tx);
    return { txHash: (result as any).hash, cid, success: true };
  } catch (err: any) {
    console.error("[Audit] recordAuditEvent error:", err?.message || err);
    return { txHash: "", cid: "", success: false };
  }
}

/**
 * Fetches all manage_data entries for a pool from the platform account
 */
export async function getAuditTrail(poolId: string): Promise<AuditEntry[]> {
  try {
    const secretKey = process.env.STELLAR_PLATFORM_SECRET_KEY;
    if (!secretKey) return [];

    const { networkPassphrase } = getStellarConfig();
    const server = getHorizonServer();
    const platformKeypair = Keypair.fromSecret(secretKey);
    const platformPublicKey = platformKeypair.publicKey();

    // Get all transactions from platform account, filter by memo pattern
    const txRecords = await server
      .transactions()
      .forAccount(platformPublicKey)
      .limit(100)
      .order("desc")
      .call();

    const entries: AuditEntry[] = [];
    for (const record of txRecords.records) {
      const memo: string = (record as any).memo || "";
      // Check if this tx is an audit for this pool
      // We also look at data entries on the account
      if (memo.includes(poolId.slice(0, 6)) || memo.includes("AUDIT")) {
        entries.push({
          poolId,
          eventType: (memo.split(":")[0] as AuditEventType) || "BRAND_APPROVED",
          dataCID: memo.split(":")[1] || "",
          txHash: (record as any).hash,
          timestamp: new Date((record as any).created_at),
          recorder: platformPublicKey,
        });
      }
    }
    return entries;
  } catch (err) {
    console.error("[Audit] getAuditTrail error:", err);
    return [];
  }
}

/**
 * Returns Stellar explorer URL for a transaction
 */
export function getAuditTxUrl(txHash: string): string {
  return getStellarExpertUrl(txHash, "tx");
}
