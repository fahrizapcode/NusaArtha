import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = await prisma.investmentPool.findUnique({
      where: { id },
      include: {
        brand: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        investments: {
          include: {
            investor: { select: { id: true, name: true, email: true, walletAddress: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        outlets: {
          include: {
            operator: { select: { id: true, name: true, email: true } },
            posTransactions: {
              orderBy: { timestamp: "desc" },
              take: 30,
            },
          },
        },
      },
    });

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Calculate funding progress
    const collected = pool.investments.reduce(
      (sum, inv) => sum + inv.tokensOwned * pool.pricePerToken,
      0
    );
    const progress = Math.min(100, Math.round((collected / pool.targetFunding) * 100));

    return NextResponse.json({ pool, collected, progress });
  } catch (err) {
    console.error("[GET /api/pools/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch pool" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      "status",
      "smartContractAddr",
      "disclosureCID",
      "name",
      "location",
      "targetFunding",
      "totalSupply",
      "pricePerToken",
      "revenueShares",
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updateData[key] =
          key === "revenueShares" ? JSON.stringify(body[key]) : body[key];
      }
    }

    const pool = await prisma.investmentPool.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ pool });
  } catch (err) {
    console.error("[PATCH /api/pools/[id]]", err);
    return NextResponse.json({ error: "Failed to update pool" }, { status: 500 });
  }
}
