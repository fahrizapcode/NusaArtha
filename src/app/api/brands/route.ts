import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get("riskLevel");
    const search = searchParams.get("search");

    const brands = await prisma.brand.findMany({
      where: {
        ...(riskLevel && riskLevel !== "ALL" ? { riskLevel } : {}),
        ...(search
          ? { name: { contains: search } }
          : {}),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        pools: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ brands });
  } catch (err) {
    console.error("[GET /api/brands]", err);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
