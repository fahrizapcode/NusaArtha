import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const outlet = await prisma.outlet.findUnique({
      where: { id },
      include: {
        operator: { select: { id: true, name: true, email: true } },
        pool: {
          include: {
            brand: { select: { id: true, name: true, businessType: true } },
          },
        },
        posTransactions: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
      },
    });

    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }

    // Revenue stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = outlet.posTransactions
      .filter((tx) => tx.timestamp >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = outlet.posTransactions
      .filter((tx) => tx.timestamp >= today)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({ outlet, monthlyRevenue, todayRevenue });
  } catch (err) {
    console.error("[GET /api/outlets/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch outlet" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const allowed = ["status", "operatorId", "name", "location"];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const outlet = await prisma.outlet.update({ where: { id }, data: updateData });
    return NextResponse.json({ outlet });
  } catch (err) {
    console.error("[PATCH /api/outlets/[id]]", err);
    return NextResponse.json({ error: "Failed to update outlet" }, { status: 500 });
  }
}
