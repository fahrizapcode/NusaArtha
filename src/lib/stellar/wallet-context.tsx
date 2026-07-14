"use client";
// src/lib/stellar/wallet-context.tsx
// Global Freighter wallet state context

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  connectFreighter,
  getFreighterPublicKey,
  isFreighterConnected,
  isFreighterInstalled,
  signTransactionWithFreighter,
} from "./freighter";
import { getAccountBalances, fundTestnetAccount } from "./horizon";
import { STELLAR_NETWORK, FREIGHTER_DOWNLOAD_URL } from "./config";

type WalletState = {
  publicKey: string | null;
  isConnected: boolean;
  isInstalled: boolean;
  isLoading: boolean;
  balances: { asset: string; balance: string }[];
  network: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  signXdr: (xdr: string) => Promise<string | null>;
  refreshBalances: () => Promise<void>;
  fundTestnet: () => Promise<boolean>;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState<{ asset: string; balance: string }[]>([]);
  const [network, setNetwork] = useState<string | null>(null);

  // Check on mount
  useEffect(() => {
    const installed = isFreighterInstalled();
    setIsInstalled(installed);
    if (installed) {
      isFreighterConnected().then(async (connected) => {
        if (connected) {
          const pk = await getFreighterPublicKey();
          if (pk) {
            setPublicKey(pk);
            setIsConnected(true);
            setNetwork(STELLAR_NETWORK);
          }
        }
      });
    }
  }, []);

  // Refresh balances whenever publicKey changes
  useEffect(() => {
    if (publicKey) refreshBalances();
  }, [publicKey]);

  const refreshBalances = useCallback(async () => {
    if (!publicKey) return;
    const bal = await getAccountBalances(publicKey);
    setBalances(bal);
  }, [publicKey]);

  const connect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const conn = await connectFreighter();
      if (!conn) {
        setIsLoading(false);
        return false;
      }
      setPublicKey(conn.publicKey);
      setIsConnected(true);
      setNetwork(conn.network);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
    setBalances([]);
    setNetwork(null);
  }, []);

  const signXdr = useCallback(
    async (xdr: string): Promise<string | null> => {
      return signTransactionWithFreighter(xdr, publicKey || undefined);
    },
    [publicKey]
  );

  const fundTestnet = useCallback(async (): Promise<boolean> => {
    if (!publicKey) return false;
    return fundTestnetAccount(publicKey);
  }, [publicKey]);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected,
        isInstalled,
        isLoading,
        balances,
        network,
        connect,
        disconnect,
        signXdr,
        refreshBalances,
        fundTestnet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
