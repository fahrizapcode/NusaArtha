// src/lib/stellar/hooks.ts
// React hooks for Stellar/Soroban interactions in NusaArtha

import { useState, useEffect, useCallback } from "react";
import { 
  getTokenBalance, 
  establishTrustline, 
  hasTrustline,
  getNativeBalance,
  getAllPoolBalances,
  getPoolAsset,
  PoolAsset
} from "./assets";
import { 
  castVoteOnStellar, 
  hasVotedOnChain,
  VoteResult 
} from "./governance";
import {
  getOutletTokenBalance,
  buildBuyTokensXdr,
  submitSignedXdr,
  getGovernanceProposals,
  getAuditLogsFromContract,
  getPoolInfo
} from "./soroban";
import { signTransactionWithFreighter } from "./wallet";
import { getStellarConfig } from "./network";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PoolBalance = {
  assetCode: string;
  issuer: string;
  balance: number;
};

export type BuyTokensResult = {
  txHash: string;
  success: boolean;
  error?: string;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Hook to get token balance for a specific pool (Stellar Asset)
 */
export function usePoolBalance(publicKey: string | null, poolId: string) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!publicKey || !poolId) {
        setBalance(0);
        return;
      }
      setLoading(true);
      try {
        const bal = await getTokenBalance(publicKey, poolId);
        setBalance(bal);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey, poolId]);

  return { balance, loading };
}

/**
 * Hook to get XLM (native) balance
 */
export function useNativeBalance(publicKey: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!publicKey) {
        setBalance(0);
        return;
      }
      setLoading(true);
      try {
        const bal = await getNativeBalance(publicKey);
        setBalance(bal);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey]);

  return { balance, loading };
}

/**
 * Hook to get all pool balances for a wallet
 */
export function useAllPoolBalances(publicKey: string | null) {
  const [balances, setBalances] = useState<PoolBalance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!publicKey) {
        setBalances([]);
        return;
      }
      setLoading(true);
      try {
        const bals = await getAllPoolBalances(publicKey);
        setBalances(bals);
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey]);

  return { balances, loading };
}

/**
 * Hook to check and establish trustline for a pool
 */
export function useTrustline(publicKey: string | null, poolId: string) {
  const [hasTrust, setHasTrust] = useState(false);
  const [checking, setChecking] = useState(false);
  const [establishing, setEstablishing] = useState(false);

  const checkTrustline = useCallback(async () => {
    if (!publicKey || !poolId) return;
    setChecking(true);
    const has = await hasTrustline(publicKey, poolId);
    setHasTrust(has);
    setChecking(false);
  }, [publicKey, poolId]);

  const establishTrust = useCallback(async () => {
    if (!publicKey || !poolId) {
      return { success: false, error: "Missing publicKey or poolId" };
    }
    setEstablishing(true);
    const result = await establishTrustline(publicKey, poolId);
    setEstablishing(false);
    if (result.success) {
      setHasTrust(true);
    }
    return result;
  }, [publicKey, poolId]);

  useEffect(() => {
    void (async () => {
      await checkTrustline();
    })();
  }, [checkTrustline]);

  return { hasTrust, checking, establishing, establishTrust, checkTrustline };
}

/**
 * Hook for buying pool tokens via Soroban smart contract
 */
export function useBuyTokens(contractId: string | null, publicKey: string | null) {
  const [buying, setBuying] = useState(false);

  const buyTokens = useCallback(
    async (tokenAmount: number): Promise<BuyTokensResult> => {
      if (!contractId || !publicKey) {
        return { success: false, txHash: "", error: "Missing contractId or publicKey" };
      }

      try {
        setBuying(true);
        const { networkPassphrase } = getStellarConfig();
        const amountBigInt = BigInt(tokenAmount);

        // Build unsigned XDR
        const xdr = await buildBuyTokensXdr(contractId, publicKey, amountBigInt);
        if (!xdr) {
          return { success: false, txHash: "", error: "Failed to build transaction" };
        }

        // Sign with Freighter
        const signedXdr = await signTransactionWithFreighter(xdr, networkPassphrase);
        if (!signedXdr) {
          return { success: false, txHash: "", error: "User cancelled transaction" };
        }

        // Submit to network
        const result = await submitSignedXdr(signedXdr);
        return {
          success: result.success,
          txHash: result.txHash || "",
          error: result.error,
        };
      } catch (err: unknown) {
        const e = err as { message?: string };
        return {
          success: false,
          txHash: "",
          error: e.message || "Transaction failed",
        };
      } finally {
        setBuying(false);
      }
    },
    [contractId, publicKey]
  );

  return { buyTokens, buying };
}

/**
 * Hook for governance voting via Stellar on-chain data entries
 */
export function useGovernanceVote(publicKey: string | null) {
  const [voting, setVoting] = useState(false);

  const castVote = useCallback(
    async (proposalId: string, poolId: string, optionId: number): Promise<VoteResult> => {
      if (!publicKey) {
        return { success: false, txHash: "", error: "Wallet not connected" };
      }

      setVoting(true);
      const result = await castVoteOnStellar(publicKey, proposalId, poolId, optionId);
      setVoting(false);
      return result;
    },
    [publicKey]
  );

  const checkVoted = useCallback(
    async (proposalId: string) => {
      if (!publicKey) return { voted: false, optionId: null };
      return hasVotedOnChain(publicKey, proposalId);
    },
    [publicKey]
  );

  return { castVote, checkVoted, voting };
}

/**
 * Hook to get Soroban contract token balance
 */
export function useSorobanTokenBalance(contractId: string | null, publicKey: string | null) {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!contractId || !publicKey) {
        setBalance(BigInt(0));
        return;
      }
      setLoading(true);
      try {
        const bal = await getOutletTokenBalance(contractId, publicKey);
        setBalance(bal);
      } finally {
        setLoading(false);
      }
    })();
  }, [contractId, publicKey]);

  return { balance, loading };
}

/**
 * Hook to get governance proposals from Soroban contract
 */
export function useSorobanProposals(poolId: string | null, publicKey: string | null) {
  const [proposals, setProposals] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!poolId || !publicKey) {
        setProposals([]);
        return;
      }
      setLoading(true);
      try {
        const props = await getGovernanceProposals(poolId, publicKey);
        setProposals(props);
      } finally {
        setLoading(false);
      }
    })();
  }, [poolId, publicKey]);

  return { proposals, loading };
}

/**
 * Hook to get audit logs from Soroban contract
 */
export function useSorobanAuditLogs(poolId: string | null, publicKey: string | null) {
  const [logs, setLogs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!poolId || !publicKey) {
        setLogs([]);
        return;
      }
      setLoading(true);
      try {
        const result = await getAuditLogsFromContract(poolId, publicKey);
        setLogs(result);
      } finally {
        setLoading(false);
      }
    })();
  }, [poolId, publicKey]);

  return { logs, loading };
}

/**
 * Hook to get pool info from factory Soroban contract
 */
export function useSorobanPoolInfo(poolId: string | null, publicKey: string | null) {
  const [poolInfo, setPoolInfo] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!poolId || !publicKey) {
        setPoolInfo(null);
        return;
      }
      setLoading(true);
      try {
        const info = await getPoolInfo(poolId, publicKey);
        setPoolInfo(info);
      } finally {
        setLoading(false);
      }
    })();
  }, [poolId, publicKey]);

  return { poolInfo, loading };
}

/**
 * Hook to get pool asset details
 */
export function usePoolAsset(poolId: string | null): PoolAsset | null {
  if (!poolId) return null;
  try {
    const asset = getPoolAsset(poolId);
    return {
      code: asset.getCode(),
      issuer: asset.getIssuer(),
    };
  } catch {
    return null;
  }
}
