// src/app/api/operator/performance/route.ts
// Operator Performance Score for current logged-in operator

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateOperatorPerformance } from "@/lib/scoring/operator-performance";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = payload.id as string;

    const outlets = await prisma.outlet.findMany({
      where: { operatorId: userId },
      include: {
        posTransactions: {
          orderBy: { timestamp: "desc" },
          take: 60,
          select: { amount: true, timestamp: true },
        },
        pool: { select: { name: true, targetFunding: true } },
      },
    });

    if (outlets.length === 0) {
      return NextResponse.json({
        score: null,
        message: "Belum ada outlet yang ditugaskan",
      });
    }

    // Aggregate across all outlets
    const allTxs = outlets.flatMap((o) => o.posTransactions);
    const totalRevenue = allTxs.reduce((s, t) => s + t.amount, 0);

    const now = new Date();
    const thisMonthTxs = allTxs.filter(
      (t) => new Date(t.timestamp).getMonth() === now.getMonth()
    );

    const monthlyTarget =
      outlets.reduce((s, o) => s + o.pool.targetFunding, 0) / 18;
    const thisMonthRevenue = thisMonthTxs.reduce((s, t) => s + t.amount, 0);
    const salesScore = Math.min(
      100,
      Math.round((thisMonthRevenue / Math.max(monthlyTarget, 1)) * 100)
    );

    const reportConsistencyScore = Math.min(
      100,
      Math.round((thisMonthTxs.length / (new Date().getDate() * outlets.length)) * 100)
    );

    const scoreResult = calculateOperatorPerformance({
      salesScore,
      sopComplianceScore: 75,
      stockAccuracyScore: 80,
      reportConsistencyScore,
      customerReviewScore: 70,
      operationalEfficiencyScore: 75,
    });

    // Operator-to-Ownership: kalkulasi akumulasi
    const monthlyIncentive = (thisMonthRevenue * 0.20); // 20% operator share
    const ownershipAccumulation = scoreResult.eligibleForOwnership
      ? Math.round(monthlyIncentive * 0.33) // 1/3 dari insentif untuk ownership
      : 0;

    return NextResponse.json({
      score: scoreResult,
      metrics: {
        totalRevenue,
        thisMonthRevenue,
        txCount: allTxs.length,
        outletCount: outlets.length,
        monthlyIncentive,
        ownershipAccumulation,
      },
    });
  } catch (err) {
    console.error("[GET /api/operator/performance]", err);
    return NextResponse.json({ error: "Gagal menghitung performa" }, { status: 500 });
  }
}
