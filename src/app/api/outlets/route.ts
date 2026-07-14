import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");
    const operatorId = searchParams.get("operatorId");
    const status = searchParams.get("status");

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
