// src/app/api/operators/[id]/route.ts
// Get / update operator detail (admin)

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateOperatorPerformance } from "@/lib/scoring/operator-performance";

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
    if (!payload?.role || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const operator = await prisma.user.findUnique({
      where: { id, role: "OPERATOR" },
      select: {
        id: true,
        name: true,
        email: true,
        walletAddress: true,
        createdAt: true,
        operatedOutlets: {
          include: {
            posTransactions: {
              orderBy: { timestamp: "desc" },
              take: 30,
              select: { amount: true, timestamp: true },
            },
            pool: { select: { name: true, brand: { select: { name: true } } } },
          },
        },
      },
    });

    if (!operator) return NextResponse.json({ error: "Operator tidak ditemukan" }, { status: 404 });

    // Calculate metrics per outlet
    const outletsWithScore = operator.operatedOutlets.map((outlet) => {
      const txs = outlet.posTransactions;
      const totalRevenue = txs.reduce((s, t) => s + t.amount, 0);

      // Simplified scoring for demo — dalam produksi dari data aktual POS + audit
      const salesScore = Math.min(100, Math.round((totalRevenue / 50_000_000) * 100));
      const score = calculateOperatorPerformance({
        salesScore,
        sopComplianceScore: 75, // default — bisa dari audit form
        stockAccuracyScore: 80,
        reportConsistencyScore: txs.length > 20 ? 90 : 50,
        customerReviewScore: 70,
        operationalEfficiencyScore: 75,
      });

      return {
        ...outlet,
        posTransactions: undefined,
        monthlyRevenue: totalRevenue,
        txCount: txs.length,
        performanceScore: score,
      };
    });

    return NextResponse.json({ operator: { ...operator, operatedOutlets: outletsWithScore } });
  } catch (err) {
    console.error("[GET /api/operators/[id]]", err);
    return NextResponse.json({ error: "Gagal memuat operator" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJwt(token);
    if (!payload?.role || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { outletId } = body; // assign operator to outlet

    if (outletId) {
      await prisma.outlet.update({
        where: { id: outletId },
        data: { operatorId: id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/operators/[id]]", err);
    return NextResponse.json({ error: "Gagal memperbarui operator" }, { status: 500 });
  }
}
