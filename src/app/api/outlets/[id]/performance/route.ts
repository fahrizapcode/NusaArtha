// src/app/api/outlets/[id]/performance/route.ts
// Outlet Performance Score endpoint

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateOutletPerformance } from "@/lib/scoring/outlet-performance";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const outlet = await prisma.outlet.findUnique({
      where: { id },
      include: {
        posTransactions: {
          orderBy: { timestamp: "desc" },
          take: 90, // last 90 transactions
          select: { amount: true, timestamp: true },
        },
        pool: {
          select: {
            name: true,
            targetFunding: true,
            brand: { select: { name: true } },
          },
        },
      },
    });

    if (!outlet) return NextResponse.json({ error: "Outlet tidak ditemukan" }, { status: 404 });

    const txs = outlet.posTransactions;

    // Group by month for trend calculation
    const now = new Date();
    const thisMonth = txs.filter(
      (t) => new Date(t.timestamp).getMonth() === now.getMonth()
    );
    const lastMonth = txs.filter((t) => {
      const d = new Date(t.timestamp);
      return d.getMonth() === now.getMonth() - 1;
    });

    const thisMonthRevenue = thisMonth.reduce((s, t) => s + t.amount, 0);
    const lastMonthRevenue = lastMonth.reduce((s, t) => s + t.amount, 0);
    const totalRevenue = txs.reduce((s, t) => s + t.amount, 0);

    // Estimate monthly target as targetFunding / 18 months (BEP assumption)
    const monthlyTarget = outlet.pool.targetFunding / 18;
    const revenueVsTargetScore = Math.min(
      100,
      Math.round((thisMonthRevenue / Math.max(monthlyTarget, 1)) * 100)
    );

    // Growth trend: positive if thisMonth > lastMonth
    let growthTrendScore = 50;
    if (lastMonthRevenue > 0) {
      const growth = (thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue;
      growthTrendScore = Math.min(100, Math.max(0, Math.round(50 + growth * 100)));
    }

    // Transaction volume: 10+ per day = 100
    const dailyAvgTx =
      thisMonth.length / Math.max(new Date().getDate(), 1);
    const transactionVolumeScore = Math.min(100, Math.round((dailyAvgTx / 10) * 100));

    const scoreResult = calculateOutletPerformance({
      revenueVsTargetScore,
      growthTrendScore,
      operationalCostRatioScore: 70, // placeholder — perlu data biaya dari POS
      transactionVolumeScore,
      sopComplianceScore: 75, // placeholder — dari audit visit
      customerRetentionScore: 65,   // placeholder
    });

    return NextResponse.json({
      outlet: {
        id: outlet.id,
        name: outlet.name,
        location: outlet.location,
        status: outlet.status,
        poolName: outlet.pool.name,
        brandName: outlet.pool.brand.name,
      },
      metrics: {
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        txCount: txs.length,
        dailyAvgTx: dailyAvgTx.toFixed(1),
        monthlyTarget,
      },
      performanceScore: scoreResult,
    });
  } catch (err) {
    console.error("[GET /api/outlets/[id]/performance]", err);
    return NextResponse.json({ error: "Gagal menghitung performa" }, { status: 500 });
  }
}
