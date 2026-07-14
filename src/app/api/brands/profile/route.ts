// src/app/api/brands/profile/route.ts
// Save/update extended brand profile (from /profile/complete)

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const ownerId = payload.id as string;
    const body = await request.json();

    // Find brand milik user ini
    const brand = await prisma.brand.findFirst({ where: { ownerId } });
    if (!brand) return NextResponse.json({ error: "Brand tidak ditemukan" }, { status: 404 });

    const {
      description, vision, mission, phone, website, socialMedia,
      yearFounded, nib, npwp, outletCount, outletLocations,
      monthlyRevenue, monthlyTransactions, averageOrderValue,
      operationalCosts, capitalPerOutlet, supplyChain,
      qualityStandard, mainProducts, markComplete,
    } = body;

    const updated = await prisma.brand.update({
      where: { id: brand.id },
      data: {
        ...(description !== undefined && { description }),
        ...(vision !== undefined && { vision }),
        ...(mission !== undefined && { mission }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(socialMedia !== undefined && { socialMedia }),
        ...(yearFounded !== undefined && { yearFounded: yearFounded ? Number(yearFounded) : null }),
        ...(nib !== undefined && { nib }),
        ...(npwp !== undefined && { npwp }),
        ...(outletCount !== undefined && { outletCount: outletCount ? Number(outletCount) : null }),
        ...(outletLocations !== undefined && { outletLocations: JSON.stringify(outletLocations) }),
        ...(monthlyRevenue !== undefined && { monthlyRevenue: monthlyRevenue ? Number(String(monthlyRevenue).replace(/\D/g, "")) : null }),
        ...(monthlyTransactions !== undefined && { monthlyTransactions: monthlyTransactions ? Number(monthlyTransactions) : null }),
        ...(averageOrderValue !== undefined && { averageOrderValue: averageOrderValue ? Number(String(averageOrderValue).replace(/\D/g, "")) : null }),
        ...(operationalCosts !== undefined && { operationalCosts: operationalCosts ? Number(String(operationalCosts).replace(/\D/g, "")) : null }),
        ...(capitalPerOutlet !== undefined && { capitalPerOutlet: capitalPerOutlet ? Number(String(capitalPerOutlet).replace(/\D/g, "")) : null }),
        ...(supplyChain !== undefined && { supplyChain }),
        ...(qualityStandard !== undefined && { qualityStandard }),
        ...(mainProducts !== undefined && { mainProducts: JSON.stringify(mainProducts) }),
        ...(markComplete && { profileCompletedAt: new Date() }),
      },
    });

    return NextResponse.json({ brand: updated, message: "Profil berhasil disimpan" });
  } catch (err) {
    console.error("[POST /api/brands/profile]", err);
    return NextResponse.json({ error: "Gagal menyimpan profil" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const ownerId = payload.id as string;
    const brand = await prisma.brand.findFirst({ where: { ownerId } });
    if (!brand) return NextResponse.json({ brand: null });

    return NextResponse.json({ brand });
  } catch (err) {
    console.error("[GET /api/brands/profile]", err);
    return NextResponse.json({ error: "Gagal mengambil profil" }, { status: 500 });
  }
}
