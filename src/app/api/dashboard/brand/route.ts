// src/app/api/dashboard/brand/route.ts
// Brand owner dashboard data API

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");
  const ownerId = searchParams.get("ownerId");

  try {
    let resolvedOwnerId = ownerId;

    if (!resolvedOwnerId && walletAddress) {
      const user = await prisma.user.findFirst({ where: { walletAddress } });
      resolvedOwnerId = user?.id || null;
    }

    if (!resolvedOwnerId) {
      return NextResponse.json({ brand: null, pools: [], stats: null });
    }

    const brand = await prisma.brand.findFirst({
      where: { ownerId: resolvedOwnerId },
      include: {
        pools: {
          include: {
            investments: { select: { id: true, tokensOwned: true } },
            outlets: { select: { id: true, status: true } },
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ brand: null, pools: [], stats: null });
    }

    // Compute stats
    const totalPools = brand.pools.length;
    const activePools = brand.pools.filter((p) =>
      ["PUBLISHED", "ACTIVE", "OPERATING"].includes(p.status)
    ).length;
    const totalOutlets = brand.pools.reduce((s, p) => s + p.outlets.length, 0);
    const operatingOutlets = brand.pools.reduce(
      (s, p) => s + p.outlets.filter((o) => o.status === "OPERATING").length, 0
    );
    const totalFunding = brand.pools.reduce((s, p) => {
      const collected = p.investments.reduce(
        (acc, inv) => acc + inv.tokensOwned * p.pricePerToken, 0
      );
      return s + collected;
    }, 0);

    // Monitoring summary per pool
    const pools = brand.pools.map((p) => {
      const collected = p.investments.reduce(
        (acc, inv) => acc + inv.tokensOwned * p.pricePerToken, 0
      );
      const progress = Math.min(100, Math.round((collected / p.targetFunding) * 100));
      return {
        id: p.id,
        name: p.name,
        location: p.location,
        status: p.status,
        targetFunding: p.targetFunding,
        collected,
        progress,
        investors: new Set(p.investments.map((i: any) => i.investorId)).size,
        outlets: p.outlets.length,
      };
    });

    return NextResponse.json({
      brand: {
        id: brand.id,
        name: brand.name,
        businessType: brand.businessType,
        riskLevel: brand.riskLevel,
        readinessScore: brand.readinessScore,
        legalDocsCID: brand.legalDocsCID,
        sopDocsCID: brand.sopDocsCID,
      },
      pools,
      stats: {
        totalPools,
        activePools,
        totalOutlets,
        operatingOutlets,
        totalFunding,
        isApproved: !["PENDING", "HIGH_RISK"].includes(brand.riskLevel),
        isPending: brand.riskLevel === "PENDING",
      },
    });
  } catch (err) {
    console.error("[GET /api/dashboard/brand]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
