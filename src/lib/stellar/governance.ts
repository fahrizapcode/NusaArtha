// src/lib/stellar/governance.ts
// Governance voting using Stellar Data Entries (manage_data operations)
// Each vote is recorded on-chain via an account data entry.
// Proposal metadata is stored on IPFS, referenced by a Stellar transaction memo.

import {
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Memo,
} from "@stellar/stellar-sdk";
import { getHorizonServer, getStellarConfig } from "./network";
import { signTransactionWithFreighter } from "./wallet";
import { uploadJSONToIPFS, getIPFSGatewayUrl } from "@/lib/ipfs";
import { getTokenBalance } from "./assets";

export type GovernanceProposal = {
  id: string;
  poolId: string;
  title: string;
  description: string;
  descriptionCID: string;
  options: string[];
  deadline: Date;
  createdAt: Date;
  votingEndTime: number; // unix timestamp
  totalVotes: number;
  optionVotes: number[];
  executed: boolean;
  winningOptionId: number | null;
};

export type VoteResult = {
  txHash: string;
  success: boolean;
  error?: string;
  explorerUrl?: string;
};

/**
 * Records a governance vote on-chain via Stellar manage_data operation.
 * Key: `VOTE:proposalId` → Value: `optionId` (as buffer)
 * Also verifies the voter holds pool tokens (vote weight).
 */
export async function castVoteOnStellar(
  voterPublicKey: string,
  proposalId: string,
  poolId: string,
  optionId: number
): Promise<VoteResult> {
  try {
    const { networkPassphrase, network } = getStellarConfig();
    const server = getHorizonServer();

    // Check token balance (vote weight)
    const balance = await getTokenBalance(voterPublicKey, poolId);
    if (balance <= 0) {
      return {
        txHash: "",
        success: false,
        error: "Anda tidak memiliki token untuk pool ini. Tidak dapat vote.",
      };
    }

    const account = await server.loadAccount(voterPublicKey);

    // Key is max 64 chars, value max 64 bytes
    const dataKey = `VOTE:${proposalId}`.slice(0, 64);
    const dataValue = Buffer.from(`${optionId}:${Date.now()}`);

    const tx = new TransactionBuilder(account, {
      fee: (parseInt(BASE_FEE) * 2).toString(),
      networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: dataKey,
          value: dataValue,
        })
      )
      .addMemo(Memo.text(`VOTE:${proposalId.slice(0, 20)}`))
      .setTimeout(30)
      .build();

    const signedXdr = await signTransactionWithFreighter(
      tx.toXDR(),
      networkPassphrase
    );
    if (!signedXdr) {
      return { txHash: "", success: false, error: "Transaksi dibatalkan pengguna" };
    }

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
    const detail =
      err?.response?.data?.extras?.result_codes
        ? JSON.stringify(err.response.data.extras.result_codes)
        : err?.message || String(err);
    console.error("[Stellar] castVote error:", detail);
    return { txHash: "", success: false, error: detail };
  }
}

/**
 * Checks if a wallet has already voted on a proposal
 * by reading their account data entries
 */
export async function hasVotedOnChain(
  publicKey: string,
  proposalId: string
): Promise<{ voted: boolean; optionId: number | null }> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    const dataKey = `VOTE:${proposalId}`.slice(0, 64);
    const entry = (account.data_attr as any)?.[dataKey];
    if (!entry) return { voted: false, optionId: null };

    const decoded = Buffer.from(entry, "base64").toString("utf8");
    const optionId = parseInt(decoded.split(":")[0]);
    return { voted: true, optionId: isNaN(optionId) ? null : optionId };
  } catch {
    return { voted: false, optionId: null };
  }
}

/**
 * Uploads a governance proposal description to IPFS and returns CID
 */
export async function uploadProposalToIPFS(proposal: {
  title: string;
  description: string;
  poolId: string;
  options: string[];
  deadline: string;
}): Promise<string> {
  return uploadJSONToIPFS(
    { ...proposal, createdAt: new Date().toISOString() },
    `proposal-${proposal.poolId}-${Date.now()}`
  );
}

/**
 * Fetches proposal details from IPFS
 */
export async function fetchProposalFromIPFS(cid: string): Promise<any | null> {
  try {
    const url = getIPFSGatewayUrl(cid);
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
