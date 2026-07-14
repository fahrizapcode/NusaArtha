import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const investorId = searchParams.get("investorId");
    const poolId = searchParams.get("poolId");
    const walletAddress = searchParams.get("walletAddress");

    // If walletAddress is provided, find investor by wallet
    let resolvedInvestorId = investorId;
    if (walletAddress && !investorId) {
      const user = await prisma.user.findFirst({ where: { walletAddress } });
      resolvedInvestorId = user?.id || null;
    }

    if (!resolvedInvestorId && !poolId) {
      return NextResponse.json({ error: "investorId or poolId required" }, { status: 400 });
    }

    const investments = await prisma.investment.findMany({
      where: {
        ...(resolvedInvestorId ? { investorId: resolvedInvestorId } : {}),
        ...(poolId ? { poolId } : {}),
      },
      include: {
        pool: {
          include: {
            brand: { select: { id: true, name: true, businessType: true } },
          },
        },
        investor: { select: { id: true, name: true, email: true, walletAddress: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ investments });
  } catch (err) {
    console.error("[GET /api/investments]", err);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { investorId, poolId, tokensOwned, walletAddress, txHash } = body;

    if (!poolId || !tokensOwned) {
      return NextResponse.json({ error: "poolId and tokensOwned required" }, { status: 400 });
    }

    // Resolve or create investor
    let resolvedInvestorId = investorId;
    if (!resolvedInvestorId && walletAddress) {
      let user = await prisma.user.findFirst({ where: { walletAddress } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            role: "INVESTOR",
            email: `${walletAddress.slice(2, 10)}@wallet.investor`,
          },
        });
      }
      resolvedInvestorId = user.id;
    }

    if (!resolvedInvestorId) {
      return NextResponse.json({ error: "Cannot resolve investor" }, { status: 400 });
    }

    // Verify pool exists and is accepting investments
    const pool = await prisma.investmentPool.findUnique({ where: { id: poolId } });
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }
    if (!["PUBLISHED", "ACTIVE"].includes(pool.status)) {
      return NextResponse.json({ error: "Pool is not accepting investments" }, { status: 400 });
    }

    // Check token availability
    const existing = await prisma.investment.findMany({ where: { poolId } });
    const tokensSold = existing.reduce((sum, inv) => sum + inv.tokensOwned, 0);
    if (tokensSold + tokensOwned > pool.totalSupply) {
      return NextResponse.json({ error: "Not enough tokens available" }, { status: 400 });
    }

    const investment = await prisma.investment.create({
      data: {
        investorId: resolvedInvestorId,
        poolId,
        tokensOwned: Number(tokensOwned),
      },
    });

    return NextResponse.json({ investment, txHash }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/investments]", err);
    return NextResponse.json({ error: "Failed to record investment" }, { status: 500 });
  }
}
