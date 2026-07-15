// src/app/api/operators/route.ts
// List semua operator (admin use)

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload?.role || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const operators = await prisma.user.findMany({
      where: {
        role: "OPERATOR",
        ...(status === "assigned" ? { operatedOutlets: { some: {} } } : {}),
        ...(status === "unassigned" ? { operatedOutlets: { none: {} } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        walletAddress: true,
        createdAt: true,
        operatedOutlets: {
          select: {
            id: true,
            name: true,
            location: true,
            status: true,
            pool: { select: { name: true, brand: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ operators });
  } catch (err) {
    console.error("[GET /api/operators]", err);
    return NextResponse.json({ error: "Gagal memuat operator" }, { status: 500 });
  }
}
