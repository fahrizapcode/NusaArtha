"use client";
// src/lib/contracts/hooks.ts
// React hooks for interacting with smart contracts via ethers.js

import { ethers } from "ethers";
import { FACTORY_ABI, OUTLET_TOKEN_ABI, GOVERNANCE_ABI, AUDIT_TRAIL_ABI } from "./abis";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
const GOVERNANCE_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS || "";
const AUDIT_TRAIL_ADDRESS = process.env.NEXT_PUBLIC_AUDIT_TRAIL_ADDRESS || "";

// ─── Provider helpers ─────────────────────────────────────────────────────────

export function getReadProvider(): ethers.JsonRpcProvider {
  const rpc = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology";
  return new ethers.JsonRpcProvider(rpc);
}

export async function getSignerProvider(): Promise<{
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  address: string;
} | null> {
  if (typeof window === "undefined" || !window.ethereum) return null;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch {
    return null;
  }
}

// ─── Contract getters ─────────────────────────────────────────────────────────

export function getFactoryContract(signerOrProvider: ethers.ContractRunner) {
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signerOrProvider);
}

export function getOutletTokenContract(
  address: string,
  signerOrProvider: ethers.ContractRunner
) {
  return new ethers.Contract(address, OUTLET_TOKEN_ABI, signerOrProvider);
}

export function getGovernanceContract(signerOrProvider: ethers.ContractRunner) {
  return new ethers.Contract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, signerOrProvider);
}

export function getAuditTrailContract(signerOrProvider: ethers.ContractRunner) {
  return new ethers.Contract(AUDIT_TRAIL_ADDRESS, AUDIT_TRAIL_ABI, signerOrProvider);
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Buys tokens from an OutletToken contract
 */
export async function buyTokens(
  tokenAddress: string,
  tokenAmount: number,
  pricePerTokenETH: string
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const conn = await getSignerProvider();
    if (!conn) return { txHash: "", success: false, error: "MetaMask tidak terhubung" };

    const contract = getOutletTokenContract(tokenAddress, conn.signer);
    // Amount in smallest unit (2 decimals for OutletToken)
    const amountBN = ethers.parseUnits(tokenAmount.toString(), 2);
    const totalValue = ethers.parseEther(
      (parseFloat(pricePerTokenETH) * tokenAmount).toFixed(18)
    );

    const tx = await contract.buyTokens(amountBN, { value: totalValue });
    const receipt = await tx.wait();
    return { txHash: receipt.hash, success: true };
  } catch (err: any) {
    console.error("[Contract] buyTokens error:", err);
    return { txHash: "", success: false, error: err.message || "Transaksi gagal" };
  }
}

/**
 * Votes on a governance proposal
 */
export async function castVote(
  proposalId: number,
  optionId: number
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const conn = await getSignerProvider();
    if (!conn) return { txHash: "", success: false, error: "MetaMask tidak terhubung" };

    const contract = getGovernanceContract(conn.signer);
    const tx = await contract.vote(proposalId, optionId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, success: true };
  } catch (err: any) {
    console.error("[Contract] castVote error:", err);
    return { txHash: "", success: false, error: err.message || "Vote gagal" };
  }
}

/**
 * Gets token balance for a wallet in an investment pool
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<number> {
  try {
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000")
      return 0;
    const provider = getReadProvider();
    const contract = getOutletTokenContract(tokenAddress, provider);
    const raw = await contract.balanceOf(walletAddress);
    // 2 decimals
    return Number(ethers.formatUnits(raw, 2));
  } catch {
    return 0;
  }
}

/**
 * Fetches all proposals for a given pool
 */
export async function getProposalsForPool(poolId: string): Promise<any[]> {
  try {
    if (!GOVERNANCE_ADDRESS) return [];
    const provider = getReadProvider();
    const contract = getGovernanceContract(provider);
    const count = await contract.nextProposalId();
    const proposals = [];
    for (let i = 0; i < Number(count); i++) {
      const p = await contract.proposals(i);
      if (p.poolId === poolId) {
        proposals.push({ ...p, id: i });
      }
    }
    return proposals;
  } catch {
    return [];
  }
}

/**
 * Gets all audit logs for a pool
 */
export async function getAuditLogs(poolId: string): Promise<any[]> {
  try {
    if (!AUDIT_TRAIL_ADDRESS) return [];
    const provider = getReadProvider();
    const contract = getAuditTrailContract(provider);
    const count = await contract.getEventLogCount(poolId);
    const logs = [];
    for (let i = 0; i < Number(count); i++) {
      const log = await contract.getEventLog(poolId, i);
      logs.push(log);
    }
    return logs;
  } catch {
    return [];
  }
}

/**
 * Gets the token address for a given pool from factory
 */
export async function getPoolTokenAddress(poolId: string): Promise<string | null> {
  try {
    if (!FACTORY_ADDRESS) return null;
    const provider = getReadProvider();
    const contract = getFactoryContract(provider);
    const addr = await contract.getPoolAddress(poolId);
    if (addr === "0x0000000000000000000000000000000000000000") return null;
    return addr;
  } catch {
    return null;
  }
}
