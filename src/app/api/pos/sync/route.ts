import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { outletId, amount, items, timestamp } = data;

    if (!outletId || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (outletId, amount)" },
        { status: 400 }
      );
    }

    // Verify outlet exists
    const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }

    // Insert real transaction into DB
    const newTx = await prisma.posTransaction.create({
      data: {
        outletId,
        amount: Number(amount),
        items: items ? JSON.stringify(items) : "{}",
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    console.log(`[POS SYNC] Outlet ${outletId}: Rp${amount} - TX ${newTx.id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction synchronized successfully",
        transactionId: newTx.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POS SYNC ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process POS synchronization" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get("outletId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!outletId) {
      return NextResponse.json({ error: "outletId required" }, { status: 400 });
    }

    const transactions = await prisma.posTransaction.findMany({
      where: { outletId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    // Compute summary
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = transactions
      .filter((tx) => tx.timestamp >= today)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({ transactions, totalRevenue, todayRevenue });
  } catch (error) {
    console.error("[POS GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
