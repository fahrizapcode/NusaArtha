import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");
    const operatorId = searchParams.get("operatorId");
    const status = searchParams.get("status");
    const ownerId = searchParams.get("ownerId"); // brand owner query

    // If ownerId provided, fetch outlets belonging to brand owner's pools
    if (ownerId) {
      const brand = await prisma.brand.findFirst({
        where: { ownerId },
        select: { id: true },
      });

      if (!brand) return NextResponse.json({ outlets: [] });

      const pools = await prisma.investmentPool.findMany({
        where: { brandId: brand.id },
        select: { id: true, name: true, brand: { select: { name: true } } },
      });

      const poolIds = pools.map((p) => p.id);
      const poolMap = Object.fromEntries(pools.map((p) => [p.id, p]));

      const outlets = await prisma.outlet.findMany({
        where: { poolId: { in: poolIds } },
        include: {
          operator: { select: { id: true, name: true, email: true } },
          posTransactions: {
            where: {
              timestamp: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
            select: { amount: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const mapped = outlets.map((o) => ({
        id: o.id,
        name: o.name,
        poolName: poolMap[o.poolId]?.name || "",
        location: o.location,
        city: o.location.split(",").pop()?.trim() || o.location,
        openDate: o.status === "OPERATING" || o.status === "ACTIVE"
          ? new Date(o.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
          : "Menunggu",
        operatorName: o.operator?.name || o.operator?.email || null,
        status: o.status,
        monthlyRevenue: o.posTransactions.reduce((s, t) => s + t.amount, 0),
      }));

      return NextResponse.json({ outlets: mapped });
    }

    const outlets = await prisma.outlet.findMany({
      where: {
        ...(poolId ? { poolId } : {}),
        ...(operatorId ? { operatorId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        operator: { select: { id: true, name: true, email: true, walletAddress: true } },
        pool: {
          include: {
            brand: { select: { id: true, name: true } },
          },
        },
        posTransactions: {
          orderBy: { timestamp: "desc" },
          take: 7,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ outlets });
  } catch (err) {
    console.error("[GET /api/outlets]", err);
    return NextResponse.json({ error: "Failed to fetch outlets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { poolId, operatorId, name, location, status } = body;

    if (!poolId || !name || !location) {
      return NextResponse.json({ error: "poolId, name, location required" }, { status: 400 });
    }

    const outlet = await prisma.outlet.create({
      data: {
        poolId,
        operatorId: operatorId || null,
        name,
        location,
        status: status || "PENDING",
      },
    });

    return NextResponse.json({ outlet }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/outlets]", err);
    return NextResponse.json({ error: "Failed to create outlet" }, { status: 500 });
  }
}
