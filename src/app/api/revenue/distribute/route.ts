// src/app/api/revenue/distribute/route.ts
// Admin-triggered revenue distribution via Stellar payments

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { distributeRevenue } from "@/lib/stellar/transactions";
import { calculateDistributableCash } from "@/lib/pos/distributable-cash";
import { recordAuditEvent } from "@/lib/stellar/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poolId, grossRevenue, cogs, operatorCosts, rentAndUtilities, taxes, maintenanceCosts } = body;

    if (!poolId || !grossRevenue) {
      return NextResponse.json({ error: "poolId and grossRevenue required" }, { status: 400 });
    }

    // Fetch pool with investments and investor wallets
    const pool = await prisma.investmentPool.findUnique({
      where: { id: poolId },
      include: {
        investments: {
          include: {
            investor: { select: { walletAddress: true, name: true } },
          },
        },
      },
    });

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    if (pool.status !== "OPERATING") {
      return NextResponse.json({ error: "Pool must be in OPERATING status" }, { status: 400 });
    }

    // Parse revenue shares
    const shares = (() => {
      try { return JSON.parse(pool.revenueShares); }
      catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; }
    })();

    // Calculate distributable cash using waterfall
    const { distributableCash, allocations } = calculateDistributableCash(
      {
        grossRevenue: Number(grossRevenue),
        cogs: Number(cogs || 0),
        operatorCosts: Number(operatorCosts || 0),
        rentAndUtilities: Number(rentAndUtilities || 0),
        taxes: Number(taxes || 0),
        maintenanceCosts: Number(maintenanceCosts || 0),
        reserveFundContribution: Number(body.reserveFund || 0),
        platformMonitoringFee: Number(body.platformFee || 0),
      },
      shares
    );

    if (distributableCash <= 0) {
      return NextResponse.json({
        message: "No distributable cash available",
        distributableCash: 0,
      });
    }

    // Calculate per-investor distributions proportional to token ownership
    const totalTokens = pool.investments.reduce((s, i) => s + i.tokensOwned, 0);
    if (totalTokens === 0) {
      return NextResponse.json({ error: "No token holders" }, { status: 400 });
    }

    // Convert IDR to XLM (simplified: 1 XLM = Rp 3,500 for MVP)
    const XLM_RATE = 3500;
    const investorShareIDR = allocations.investor;
    const investorShareXLM = investorShareIDR / XLM_RATE;

    const distributions = pool.investments
      .filter((inv) => inv.investor.walletAddress)
      .map((inv) => ({
        investorPublicKey: inv.investor.walletAddress!,
        amountXLM: ((inv.tokensOwned / totalTokens) * investorShareXLM).toFixed(7),
        investorName: inv.investor.name || inv.investor.walletAddress!,
        tokensOwned: inv.tokensOwned,
      }));

    // Execute Stellar payments
    const result = await distributeRevenue(
      distributions.map((d) => ({
        investorPublicKey: d.investorPublicKey,
        amountXLM: d.amountXLM,
      })),
      poolId,
      `REV:${poolId.slice(0, 10)}`
    );

    // Record audit event on Stellar
    if (result.success) {
      recordAuditEvent("REVENUE_DISTRIBUTED", poolId, {
        grossRevenue,
        distributableCash,
        investorShareIDR,
        investorShareXLM,
        distributions,
        txHash: result.txHash,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: result.success,
      txHash: result.txHash,
      distributableCash,
      allocations,
      investorShareXLM,
      distributions,
      error: result.error,
    });
  } catch (err) {
    console.error("[POST /api/revenue/distribute]", err);
    return NextResponse.json({ error: "Distribution failed" }, { status: 500 });
  }
}
