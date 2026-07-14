// src/app/api/investments/mint/route.ts
// Server-side token minting — signs with platform secret key so the
// issuer account never needs to be exposed to the browser.

import { NextResponse } from "next/server";
import {
  Keypair,
  Asset,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Memo,
} from "@stellar/stellar-sdk";
import { getHorizonServer, getStellarConfig } from "@/lib/stellar/network";
import { poolIdToAssetCode } from "@/lib/stellar/assets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poolId, investorPublicKey, tokenAmount } = body as {
      poolId: string;
      investorPublicKey: string;
      tokenAmount: number;
    };

    if (!poolId || !investorPublicKey || !tokenAmount) {
      return NextResponse.json(
        { success: false, error: "poolId, investorPublicKey, and tokenAmount are required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.STELLAR_PLATFORM_SECRET_KEY;
    const platformPublicKey = process.env.STELLAR_PLATFORM_PUBLIC_KEY;

    if (!secretKey || !platformPublicKey) {
      return NextResponse.json(
        { success: false, error: "Platform keypair not configured on server" },
        { status: 500 }
      );
    }

    const { networkPassphrase, network } = getStellarConfig();
    const server = getHorizonServer();

    // Build the asset using server-side env (not NEXT_PUBLIC_)
    const assetCode = poolIdToAssetCode(poolId);
    const asset = new Asset(assetCode, platformPublicKey);

    // Load the platform/issuer account as the transaction source
    const platformAccount = await server.loadAccount(platformPublicKey);

    const platformKeypair = Keypair.fromSecret(secretKey);

    const tx = new TransactionBuilder(platformAccount, {
      fee: (parseInt(BASE_FEE) * 2).toString(),
      networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: investorPublicKey,
          asset,
          amount: tokenAmount.toFixed(7),
        })
      )
      .addMemo(Memo.text(`POOL:${poolId.slice(0, 10)}`))
      .setTimeout(60)
      .build();

    tx.sign(platformKeypair);

    const result = await server.submitTransaction(tx);
    const txHash = (result as any).hash;

    const explorerBase =
      network === "mainnet"
        ? "https://stellar.expert/explorer/public/tx"
        : "https://stellar.expert/explorer/testnet/tx";

    return NextResponse.json({
      success: true,
      txHash,
      explorerUrl: `${explorerBase}/${txHash}`,
    });
  } catch (err: any) {
    const resultCodes = err?.response?.data?.extras?.result_codes;
    const detail = resultCodes
      ? JSON.stringify(resultCodes)
      : err?.message || String(err);
    console.error("[POST /api/investments/mint]", detail);
    return NextResponse.json({ success: false, error: detail }, { status: 500 });
  }
}
