// src/app/api/admin/pools/route.ts
// Admin: create new investment pool from approved brand

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
      name,
      location,
      targetFunding,
      totalSupply,
      pricePerToken,
      investorShare,
      brandShare,
      operatorShare,
      platformShare,
      endDate,
      roiEstimate,
      bepEstimate,
    } = body;

    if (!brandId || !name || !location || !targetFunding || !totalSupply || !pricePerToken) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Verify brand is approved
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) return NextResponse.json({ error: "Brand tidak ditemukan" }, { status: 404 });

    if (["PENDING", "HIGH_RISK"].includes(brand.riskLevel)) {
      return NextResponse.json(
        { error: "Brand belum disetujui — tidak dapat membuat investment pool" },
        { status: 400 }
      );
    }

    const inv = Number(investorShare) || 40;
    const br = Number(brandShare) || 30;
    const op = Number(operatorShare) || 20;
    const pl = Number(platformShare) || 10;

    if (inv + br + op + pl !== 100) {
      return NextResponse.json({ error: "Total revenue share harus 100%" }, { status: 400 });
    }

    const pool = await prisma.investmentPool.create({
      data: {
        brandId,
        name,
        location,
        targetFunding: Number(targetFunding),
        totalSupply: Number(totalSupply),
        pricePerToken: Number(pricePerToken),
        status: "DRAFT",
        revenueShares: JSON.stringify({
          investor: inv,
          brand: br,
          operator: op,
          platform: pl,
        }),
        endDate: endDate ? new Date(endDate) : null,
        roiEstimate: roiEstimate || null,
        bepEstimate: bepEstimate || null,
      },
      include: {
        brand: { select: { name: true } },
      },
    });

    return NextResponse.json({ pool });
  } catch (err) {
    console.error("[POST /api/admin/pools]", err);
    return NextResponse.json({ error: "Gagal membuat pool" }, { status: 500 });
  }
}
