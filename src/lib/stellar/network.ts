// src/lib/stellar/network.ts
// Stellar network configuration and Horizon/Soroban client setup

import * as StellarSdk from "@stellar/stellar-sdk";

export type StellarNetworkConfig = {
  networkPassphrase: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  network: "testnet" | "mainnet";
};

export function getStellarConfig(): StellarNetworkConfig {
  const network =
    (process.env.NEXT_PUBLIC_STELLAR_NETWORK as "testnet" | "mainnet") ||
    "testnet";

  if (network === "mainnet") {
    return {
      network: "mainnet",
      networkPassphrase: StellarSdk.Networks.PUBLIC,
      horizonUrl:
        process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
        "https://horizon.stellar.org",
      sorobanRpcUrl:
        process.env.NEXT_PUBLIC_STELLAR_SOROBAN_RPC ||
        "https://soroban.stellar.org",
    };
  }

  return {
    network: "testnet",
    networkPassphrase: StellarSdk.Networks.TESTNET,
    horizonUrl:
      process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
      "https://horizon-testnet.stellar.org",
    sorobanRpcUrl:
      process.env.NEXT_PUBLIC_STELLAR_SOROBAN_RPC ||
      "https://soroban-testnet.stellar.org",
  };
}

/** Returns a Stellar Horizon server instance */
export function getHorizonServer(): StellarSdk.Horizon.Server {
  const { horizonUrl } = getStellarConfig();
  return new StellarSdk.Horizon.Server(horizonUrl);
}

/** Returns a Soroban RPC server instance */
export function getSorobanServer(): StellarSdk.SorobanRpc.Server {
  const { sorobanRpcUrl } = getStellarConfig();
  return new StellarSdk.SorobanRpc.Server(sorobanRpcUrl, { allowHttp: false });
}

/** Returns the Stellar Expert URL for an account / tx / asset */
export function getStellarExpertUrl(
  accountOrTx: string,
  type: "account" | "tx" | "asset" = "account"
): string {
  const { network } = getStellarConfig();
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";

  switch (type) {
    case "tx":
      return `${base}/tx/${accountOrTx}`;
    case "asset":
      return `${base}/asset/${accountOrTx}`;
    default:
      return `${base}/account/${accountOrTx}`;
  }
}
