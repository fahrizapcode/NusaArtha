"use client";
// src/lib/stellar/context.tsx
// Global Stellar wallet context – wraps the app and provides wallet state

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  connectFreighter,
  getConnectedPublicKey,
  checkFreighterInstalled,
  type StellarWalletConnection,
} from "./wallet";
import { getNativeBalance, getAllPoolBalances } from "./assets";

type WalletState = {
  isConnected: boolean;
  isFreighterInstalled: boolean;
  isCheckingInstall: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  network: string | null;
  networkPassphrase: string | null;
  xlmBalance: number;
  poolBalances: Array<{ assetCode: string; issuer: string; balance: number }>;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
};

const StellarWalletContext = createContext<WalletState>({
  isConnected: false,
  isFreighterInstalled: false,
  isCheckingInstall: true,
  isConnecting: false,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  xlmBalance: 0,
  poolBalances: [],
  connect: async () => {},
  disconnect: () => {},
  refreshBalances: async () => {},
});

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [isCheckingInstall, setIsCheckingInstall] = useState(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState(0);
  const [poolBalances, setPoolBalances] = useState<
    Array<{ assetCode: string; issuer: string; balance: number }>
  >([]);

  // Check Freighter on mount — retry a few times because extensions load async
  useEffect(() => {
    let cancelled = false;

    const check = async (attempt: number) => {
      if (cancelled) return;
      // Gunakan async check untuk Freighter v6 (@stellar/freighter-api)
      const installed = await checkFreighterInstalled();
      if (!cancelled) {
        setFreighterInstalled(installed);
        setIsCheckingInstall(false);
      }

      if (installed) {
        try {
          const key = await getConnectedPublicKey();
          if (key && !cancelled) {
            setPublicKey(key);
            setIsConnected(true);
          }
        } catch {}
      } else if (attempt < 5) {
        // Extension mungkin belum inject — retry dengan delay bertambah
        setTimeout(() => check(attempt + 1), 500 * (attempt + 1));
      }
    };

    check(0);

    return () => { cancelled = true; };
  }, []);

  // Auto-refresh balances when connected
  const refreshBalances = useCallback(async () => {
    if (!publicKey) return;
    const [xlm, pools] = await Promise.all([
      getNativeBalance(publicKey),
      getAllPoolBalances(publicKey),
    ]);
    setXlmBalance(xlm);
    setPoolBalances(pools);
  }, [publicKey]);

  useEffect(() => {
    if (isConnected && publicKey) {
      refreshBalances();
    }
  }, [isConnected, publicKey, refreshBalances]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const conn: StellarWalletConnection | null = await connectFreighter();
      if (conn) {
        setPublicKey(conn.publicKey);
        setNetwork(conn.network);
        setNetworkPassphrase(conn.networkPassphrase);
        setIsConnected(true);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setNetwork(null);
    setNetworkPassphrase(null);
    setIsConnected(false);
    setXlmBalance(0);
    setPoolBalances([]);
  }, []);

  return (
    <StellarWalletContext.Provider
      value={{
        isConnected,
        isFreighterInstalled: freighterInstalled,
        isCheckingInstall,
        isConnecting,
        publicKey,
        network,
        networkPassphrase,
        xlmBalance,
        poolBalances,
        connect,
        disconnect,
        refreshBalances,
      }}
    >
      {children}
    </StellarWalletContext.Provider>
  );
}

export function useStellarWallet() {
  return useContext(StellarWalletContext);
}
