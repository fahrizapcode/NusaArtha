// src/app/api/investor/monitoring/route.ts
// Real-time POS monitoring data for investor

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateOutletPerformance } from "@/lib/scoring/outlet-performance";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = payload.id as string;

    // Get all investment pools the investor has invested in
    const investments = await prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        pool: {
          include: {
            brand: { select: { name: true, riskLevel: true } },
            outlets: {
              include: {
                operator: { select: { name: true } },
                posTransactions: {
                  orderBy: { timestamp: "desc" },
                  take: 60,
                  select: { amount: true, items: true, timestamp: true },
                },
              },
            },
          },
        },
      },
    });

    const poolsData = investments.map((inv) => {
      const pool = inv.pool;
      const totalTokens = investments
        .filter((i) => i.poolId === pool.id)
        .reduce((s, i) => s + i.tokensOwned, 0);
      const myOwnershipPct = totalTokens > 0
        ? ((inv.tokensOwned / pool.totalSupply) * 100).toFixed(2)
        : "0.00";

      const outletsData = pool.outlets.map((outlet) => {
        const txs = outlet.posTransactions;
        const now = new Date();
        const today = txs.filter(
          (t) => new Date(t.timestamp).toDateString() === now.toDateString()
        );
        const thisMonth = txs.filter(
          (t) => new Date(t.timestamp).getMonth() === now.getMonth()
        );
        const lastMonth = txs.filter((t) => {
          const d = new Date(t.timestamp);
          return d.getMonth() === (now.getMonth() - 1 + 12) % 12;
        });

        const todayRevenue = today.reduce((s, t) => s + t.amount, 0);
        const monthRevenue = thisMonth.reduce((s, t) => s + t.amount, 0);
        const lastMonthRevenue = lastMonth.reduce((s, t) => s + t.amount, 0);
        const totalRevenue = txs.reduce((s, t) => s + t.amount, 0);

        const monthlyTarget = pool.targetFunding / 18;
        const revenueVsTargetScore = Math.min(100, Math.round((monthRevenue / Math.max(monthlyTarget, 1)) * 100));
        let growthTrendScore = 50;
        if (lastMonthRevenue > 0) {
          const g = (monthRevenue - lastMonthRevenue) / lastMonthRevenue;
          growthTrendScore = Math.min(100, Math.max(0, Math.round(50 + g * 100)));
        }
        const dailyAvg = thisMonth.length / Math.max(now.getDate(), 1);
        const transactionVolumeScore = Math.min(100, Math.round((dailyAvg / 10) * 100));

        const outletScore = calculateOutletPerformance({
          revenueVsTargetScore,
          growthTrendScore,
          operationalCostRatioScore: 70,
          transactionVolumeScore,
          sopComplianceScore: 75,
          customerRetentionScore: 65,
        });

        return {
          id: outlet.id,
          name: outlet.name,
          location: outlet.location,
          status: outlet.status,
          operatorName: outlet.operator?.name || "—",
          todayRevenue,
          monthRevenue,
          lastMonthRevenue,
          totalRevenue,
          txCount: txs.length,
          todayTxCount: today.length,
          recentTransactions: today.slice(0, 5).map((t) => ({
            amount: t.amount,
            timestamp: t.timestamp,
          })),
          performanceScore: outletScore,
        };
      });

      const shares = (() => {
        try { return JSON.parse(pool.revenueShares); }
        catch { return { investor: 40, brand: 30, operator: 20, platform: 10 }; }
      })();

      const totalMonthRevenue = outletsData.reduce((s, o) => s + o.monthRevenue, 0);
      const myMonthlyEstimate =
        (totalMonthRevenue * shares.investor) / 100 *
        (inv.tokensOwned / Math.max(pool.totalSupply, 1));

      return {
        poolId: pool.id,
        poolName: pool.name,
        location: pool.location,
        brandName: pool.brand.name,
        status: pool.status,
        tokensOwned: inv.tokensOwned,
        totalSupply: pool.totalSupply,
        myOwnershipPct,
        revenueShares: shares,
        outlets: outletsData,
        totalMonthRevenue,
        myMonthlyEstimate: Math.round(myMonthlyEstimate),
      };
    });

    return NextResponse.json({ pools: poolsData });
  } catch (err) {
    console.error("[GET /api/investor/monitoring]", err);
    return NextResponse.json({ error: "Gagal memuat data monitoring" }, { status: 500 });
  }
}
