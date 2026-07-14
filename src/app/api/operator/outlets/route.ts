// src/app/api/operator/outlets/route.ts
// Fetch outlets assigned to a specific operator

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get("operatorId");

    if (!operatorId) {
      return NextResponse.json({ error: "operatorId required" }, { status: 400 });
    }

    const outlets = await prisma.outlet.findMany({
      where: { operatorId },
      include: {
        pool: {
          select: {
            name: true,
            brand: { select: { name: true } },
          },
        },
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
      location: o.location,
      status: o.status,
      poolName: o.pool.name,
      brandName: o.pool.brand.name,
      monthlyRevenue: o.posTransactions.reduce((s, t) => s + t.amount, 0),
      txCount: o.posTransactions.length,
    }));

    return NextResponse.json({ outlets: mapped });
  } catch (err) {
    console.error("[GET /api/operator/outlets]", err);
    return NextResponse.json({ error: "Failed to fetch outlets" }, { status: 500 });
  }
}
