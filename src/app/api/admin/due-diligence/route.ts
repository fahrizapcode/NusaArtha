// src/app/api/admin/due-diligence/route.ts
// Admin: simpan due diligence result untuk brand

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadJSONToIPFS } from "@/lib/ipfs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.role || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      brandId,
      legalityValid,
      financialValid,
      sopValid,
      projectionRealistic,
      locationFeasible,
      supplyChainReady,
      riskLevel,
      readinessScore,
      notes,
      decision, // "APPROVED" | "REVISION" | "REJECTED"
    } = body;

    if (!brandId || !decision) {
      return NextResponse.json({ error: "brandId dan decision wajib diisi" }, { status: 400 });
    }

    const ddRecord = {
      brandId,
      legalityValid: Boolean(legalityValid),
      financialValid: Boolean(financialValid),
      sopValid: Boolean(sopValid),
      projectionRealistic: Boolean(projectionRealistic),
      locationFeasible: Boolean(locationFeasible),
      supplyChainReady: Boolean(supplyChainReady),
      riskLevel: riskLevel || "PENDING",
      readinessScore: Number(readinessScore) || 0,
      notes: notes || "",
      decision,
      reviewedAt: new Date().toISOString(),
      reviewedBy: payload.email as string,
    };

    // Upload ke IPFS sebagai immutable record
    const cid = await uploadJSONToIPFS(ddRecord, `due-diligence-${brandId}`).catch(() => null);

    // Update brand based on decision
    const updatedRiskLevel =
      decision === "APPROVED"
        ? (riskLevel || "MEZZANINE")
        : decision === "REJECTED"
        ? "HIGH_RISK"
        : undefined;

    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(updatedRiskLevel ? { riskLevel: updatedRiskLevel } : {}),
        ...(decision !== "REJECTED" && readinessScore ? { readinessScore: Number(readinessScore) } : {}),
        ...(cid ? { legalDocsCID: cid } : {}),
      },
    });

    return NextResponse.json({ success: true, brand, cid });
  } catch (err) {
    console.error("[POST /api/admin/due-diligence]", err);
    return NextResponse.json({ error: "Gagal menyimpan due diligence" }, { status: 500 });
  }
}
