// src/lib/wallet/metamask.ts
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type WalletConnection = {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
};

/**
 * Connects to MetaMask and returns the address, provider, and signer
 */
export async function connectMetaMask(): Promise<WalletConnection | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask is not installed');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { address, provider, signer };
  } catch (error) {
    console.error('User rejected connection or error occurred:', error);
    return null;
  }
}

/**
 * Switch network to the desired chain (e.g. Polygon Mumbai or local Hardhat)
 */
export async function switchNetwork(chainIdHex: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (error) {
    console.error('Error switching network:', error);
    return false;
  }
}
