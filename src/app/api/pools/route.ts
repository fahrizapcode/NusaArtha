import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Support multiple status values: ?status=PUBLISHED&status=ACTIVE
    const statuses = searchParams.getAll("status");
    const brandId = searchParams.get("brandId");

    const pools = await prisma.investmentPool.findMany({
      where: {
        ...(statuses.length === 1
          ? { status: statuses[0] }
          : statuses.length > 1
          ? { status: { in: statuses } }
          : {}),
        ...(brandId ? { brandId } : {}),
      },
      include: {
        brand: {
          select: { id: true, name: true, businessType: true, riskLevel: true, readinessScore: true },
        },
        investments: {
          select: { id: true, tokensOwned: true, investorId: true, createdAt: true },
        },
        outlets: { select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pools });
  } catch (err) {
    console.error("[GET /api/pools]", err);
    return NextResponse.json({ error: "Failed to fetch pools" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      brandId,
      name,
      location,
      targetFunding,
      totalSupply,
      pricePerToken,
      revenueShares,
      disclosureCID,
    } = body;

    if (!brandId || !name || !location || !targetFunding || !totalSupply || !pricePerToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pool = await prisma.investmentPool.create({
      data: {
        brandId,
        name,
        location,
        targetFunding: Number(targetFunding),
        totalSupply: Number(totalSupply),
        pricePerToken: Number(pricePerToken),
        revenueShares: revenueShares
          ? JSON.stringify(revenueShares)
          : JSON.stringify({ investor: 40, brand: 30, operator: 20, platform: 10 }),
        disclosureCID: disclosureCID || null,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ pool }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/pools]", err);
    return NextResponse.json({ error: "Failed to create pool" }, { status: 500 });
  }
}
