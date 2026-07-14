// src/lib/stellar/soroban.ts
// Soroban smart contract interactions for NusaArtha

import * as StellarSdk from "@stellar/stellar-sdk";
import { getStellarConfig, getHorizonServer } from "./network";

const FACTORY_CONTRACT_ID = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || "";
const GOVERNANCE_CONTRACT_ID = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID || "";
const AUDIT_CONTRACT_ID = process.env.NEXT_PUBLIC_AUDIT_CONTRACT_ID || "";

// ─── RPC client ───────────────────────────────────────────────────────────────

function getRpcServer(): StellarSdk.SorobanRpc.Server {
  const { sorobanRpcUrl } = getStellarConfig();
  return new StellarSdk.SorobanRpc.Server(sorobanRpcUrl, { allowHttp: true });
}

/** Load account from Horizon (which returns a proper AccountResponse) */
async function loadAccount(publicKey: string): Promise<StellarSdk.Account> {
  const server = getHorizonServer();
  const resp = await server.loadAccount(publicKey);
  return new StellarSdk.Account(resp.accountId(), resp.sequenceNumber());
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContractCallResult = {
  success: boolean;
  result?: StellarSdk.xdr.ScVal;
  txHash?: string;
  error?: string;
};

// ─── ScVal helpers ────────────────────────────────────────────────────────────

export function scString(val: string): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(val, { type: "string" });
}

export function scU32(val: number): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(val, { type: "u32" });
}

export function scI128(val: bigint): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(val, { type: "i128" });
}

export function scAddress(publicKey: string): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(new StellarSdk.Address(publicKey), { type: "address" });
}

export function scVec(items: StellarSdk.xdr.ScVal[]): StellarSdk.xdr.ScVal {
  return StellarSdk.xdr.ScVal.scvVec(items);
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Simulate a read-only Soroban call (no signing needed)
 */
export async function simulateContractCall(
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
  callerPublicKey: string
): Promise<StellarSdk.xdr.ScVal | null> {
  if (!contractId) return null;
  try {
    const rpc = getRpcServer();
    const { networkPassphrase } = getStellarConfig();
    const account = await loadAccount(callerPublicKey);
    const contract = new StellarSdk.Contract(contractId);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await rpc.simulateTransaction(tx);
    if (StellarSdk.SorobanRpc.Api.isSimulationError(sim)) {
      console.error("[Soroban] Simulation error:", (sim as any).error);
      return null;
    }

    const successSim = sim as StellarSdk.SorobanRpc.Api.SimulateTransactionSuccessResponse;
    return successSim.result?.retval ?? null;
  } catch (err) {
    console.error("[Soroban] simulateContractCall error:", err);
    return null;
  }
}

/**
 * Build an unsigned Soroban transaction XDR for signing via Freighter
 */
export async function buildContractTxXdr(
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
  callerPublicKey: string
): Promise<string | null> {
  if (!contractId) return null;
  try {
    const rpc = getRpcServer();
    const { networkPassphrase } = getStellarConfig();
    const account = await loadAccount(callerPublicKey);
    const contract = new StellarSdk.Contract(contractId);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await rpc.simulateTransaction(tx);
    if (StellarSdk.SorobanRpc.Api.isSimulationError(sim)) {
      console.error("[Soroban] Simulation error:", (sim as any).error);
      return null;
    }

    const assembled = StellarSdk.SorobanRpc.assembleTransaction(
      tx,
      sim as StellarSdk.SorobanRpc.Api.SimulateTransactionSuccessResponse
    ).build();

    return assembled.toXDR();
  } catch (err) {
    console.error("[Soroban] buildContractTxXdr error:", err);
    return null;
  }
}

/**
 * Submit a signed XDR to the network and wait for confirmation
 */
export async function submitSignedXdr(signedXdr: string): Promise<ContractCallResult> {
  try {
    const rpc = getRpcServer();
    const { networkPassphrase } = getStellarConfig();
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const sendResult = await rpc.sendTransaction(tx);

    if (sendResult.status === "ERROR") {
      return {
        success: false,
        error: (sendResult as any).errorResult?.toString() || "Send error",
      };
    }

    const hash = sendResult.hash;
    let attempts = 0;
    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 1500));
      const statusResult = await rpc.getTransaction(hash);

      if (statusResult.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        const ok = statusResult as StellarSdk.SorobanRpc.Api.GetSuccessfulTransactionResponse;
        return { success: true, txHash: hash, result: ok.returnValue };
      }
      if (statusResult.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.FAILED) {
        return { success: false, error: "Transaction failed on-chain", txHash: hash };
      }
      attempts++;
    }
    return { success: false, error: "Timeout waiting for confirmation" };
  } catch (err: any) {
    return { success: false, error: err.message || "Submit failed" };
  }
}

// ─── NusaArtha contract calls ─────────────────────────────────────────────────

/** Get token balance in an OutletToken Soroban contract */
export async function getOutletTokenBalance(
  contractId: string,
  walletPublicKey: string
): Promise<bigint> {
  try {
    const result = await simulateContractCall(
      contractId,
      "balance",
      [scAddress(walletPublicKey)],
      walletPublicKey
    );
    if (!result) return BigInt(0);
    return StellarSdk.scValToNative(result) as bigint;
  } catch {
    return BigInt(0);
  }
}

/** Build XDR to buy tokens from OutletToken Soroban contract */
export async function buildBuyTokensXdr(
  contractId: string,
  buyerPublicKey: string,
  tokenAmount: bigint
): Promise<string | null> {
  return buildContractTxXdr(contractId, "buy_tokens", [scI128(tokenAmount)], buyerPublicKey);
}

/** Build XDR to cast a governance vote via Soroban */
export async function buildVoteXdr(
  proposalId: number,
  optionId: number,
  voterPublicKey: string
): Promise<string | null> {
  if (!GOVERNANCE_CONTRACT_ID) return null;
  return buildContractTxXdr(
    GOVERNANCE_CONTRACT_ID,
    "vote",
    [scU32(proposalId), scU32(optionId)],
    voterPublicKey
  );
}

/** Get all proposals for a pool from the governance Soroban contract */
export async function getGovernanceProposals(
  poolId: string,
  callerPublicKey: string
): Promise<unknown[]> {
  if (!GOVERNANCE_CONTRACT_ID) return [];
  try {
    const result = await simulateContractCall(
      GOVERNANCE_CONTRACT_ID,
      "get_proposals_by_pool",
      [scString(poolId)],
      callerPublicKey
    );
    if (!result) return [];
    return StellarSdk.scValToNative(result) as unknown[];
  } catch {
    return [];
  }
}

/** Get audit logs for a pool from Soroban contract */
export async function getAuditLogsFromContract(
  poolId: string,
  callerPublicKey: string
): Promise<unknown[]> {
  if (!AUDIT_CONTRACT_ID) return [];
  try {
    const result = await simulateContractCall(
      AUDIT_CONTRACT_ID,
      "get_logs",
      [scString(poolId)],
      callerPublicKey
    );
    if (!result) return [];
    return StellarSdk.scValToNative(result) as unknown[];
  } catch {
    return [];
  }
}

/** Get pool info from factory Soroban contract */
export async function getPoolInfo(
  poolId: string,
  callerPublicKey: string
): Promise<unknown | null> {
  if (!FACTORY_CONTRACT_ID) return null;
  try {
    const result = await simulateContractCall(
      FACTORY_CONTRACT_ID,
      "get_pool",
      [scString(poolId)],
      callerPublicKey
    );
    if (!result) return null;
    return StellarSdk.scValToNative(result);
  } catch {
    return null;
  }
}
