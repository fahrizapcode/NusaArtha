"use client";
// src/lib/stellar/freighter.ts
// Freighter wallet integration (browser extension for Stellar)
// Freighter injects window.freighter

import { NETWORK_PASSPHRASE, FREIGHTER_DOWNLOAD_URL } from "./config";

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean }>;
      getPublicKey: () => Promise<{ publicKey: string; error?: string }>;
      signTransaction: (
        xdr: string,
        opts?: { networkPassphrase?: string; address?: string }
      ) => Promise<{ signedTxXdr: string; signerAddress: string; error?: string }>;
      requestAccess: () => Promise<{ publicKey: string; error?: string }>;
      getNetwork: () => Promise<{ network: string; networkPassphrase: string }>;
      getNetworkDetails: () => Promise<{
        network: string;
        networkPassphrase: string;
        networkUrl: string;
      }>;
    };
  }
}

export type FreighterConnection = {
  publicKey: string;
  network: string;
};

/**
 * Check if Freighter extension is installed
 */
export function isFreighterInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.freighter;
}

/**
 * Connect to Freighter wallet
 */
export async function connectFreighter(): Promise<FreighterConnection | null> {
  if (!isFreighterInstalled()) {
    console.warn("[Freighter] Not installed. Download:", FREIGHTER_DOWNLOAD_URL);
    return null;
  }

  try {
    // Request access (shows popup if not already connected)
    const access = await window.freighter!.requestAccess();
    if (access.error) {
      console.error("[Freighter] Access error:", access.error);
      return null;
    }

    const networkDetails = await window.freighter!.getNetworkDetails();

    return {
      publicKey: access.publicKey,
      network: networkDetails.network,
    };
  } catch (err) {
    console.error("[Freighter] Connection failed:", err);
    return null;
  }
}

/**
 * Get currently connected public key
 */
export async function getFreighterPublicKey(): Promise<string | null> {
  if (!isFreighterInstalled()) return null;
  try {
    const result = await window.freighter!.getPublicKey();
    if (result.error) return null;
    return result.publicKey;
  } catch {
    return null;
  }
}

/**
 * Check if Freighter is already connected (no popup)
 */
export async function isFreighterConnected(): Promise<boolean> {
  if (!isFreighterInstalled()) return false;
  try {
    const { isConnected } = await window.freighter!.isConnected();
    return isConnected;
  } catch {
    return false;
  }
}

/**
 * Sign a Stellar transaction XDR using Freighter
 */
export async function signTransactionWithFreighter(
  xdr: string,
  publicKey?: string
): Promise<string | null> {
  if (!isFreighterInstalled()) return null;
  try {
    const result = await window.freighter!.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: publicKey,
    });
    if (result.error) {
      console.error("[Freighter] Sign error:", result.error);
      return null;
    }
    return result.signedTxXdr;
  } catch (err) {
    console.error("[Freighter] signTransaction failed:", err);
    return null;
  }
}
