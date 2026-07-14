"use client";
// src/lib/stellar/wallet.ts
// Freighter wallet integration menggunakan @stellar/freighter-api package

import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

export type StellarWalletConnection = {
  publicKey: string;
  network: string;
  networkPassphrase: string;
};

/**
 * Checks if Freighter wallet extension is installed & accessible.
 * Freighter v6 (@stellar/freighter-api) tidak inject ke window lagi,
 * jadi kita pakai isConnected() dari package untuk deteksi async.
 * Fungsi sync ini hanya fallback untuk cek window lama.
 */
export function isFreighterInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as any).freighter ||
    (window as any).freighterApi
  );
}

/**
 * Async version — reliable untuk Freighter v6+
 * Pakai ini di useEffect/context untuk deteksi yang akurat
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { isConnected } = await import("@stellar/freighter-api");
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Connects to Freighter wallet dan returns connection info
 */
export async function connectFreighter(): Promise<StellarWalletConnection | null> {
  try {
    // Cek apakah extension terinstall
    const connected = await isConnected();
    if (!connected.isConnected) {
      throw new Error("Freighter tidak terdeteksi atau terkunci. Pastikan ekstensi sudah di-unlock.");
    }

    // Minta akses (tampilkan popup jika belum di-approve)
    const access = await requestAccess();
    if (access.error) {
      throw new Error(`Akses ditolak oleh Freighter. Cek ekstensi Anda.`);
    }

    // Ambil public key dan network
    const [addr, net] = await Promise.all([getAddress(), getNetwork()]);

    if (addr.error) {
      throw new Error(`Gagal mengambil alamat dari Freighter: ${addr.error}`);
    }

    return {
      publicKey: addr.address,
      network: net.network || "TESTNET",
      networkPassphrase:
        net.networkPassphrase || "Test SDF Network ; September 2015",
    };
  } catch (err: any) {
    console.error("[Freighter] Connection error:", err);
    throw new Error(err.message || "Terjadi kesalahan saat menghubungkan Freighter.");
  }
}

/**
 * Signs a Stellar transaction XDR with Freighter
 * Returns the signed XDR string
 */
export async function signTransactionWithFreighter(
  xdr: string,
  networkPassphrase: string
): Promise<string | null> {
  try {
    const result = await signTransaction(xdr, { networkPassphrase });
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

/**
 * Gets the currently connected public key tanpa prompt
 */
export async function getConnectedPublicKey(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected.isConnected) return null;

    const allowed = await isAllowed();
    if (!allowed.isAllowed) return null;

    const addr = await getAddress();
    if (addr.error) return null;

    return addr.address;
  } catch {
    return null;
  }
}

/**
 * Signs an authorization entry with Freighter (for Soroban)
 */
export async function signAuthEntryWithFreighter(
  xdr: string,
  networkPassphrase: string
): Promise<string | null> {
  // Fallback ke signTransaction jika signAuthEntry tidak ada
  return signTransactionWithFreighter(xdr, networkPassphrase);
}
