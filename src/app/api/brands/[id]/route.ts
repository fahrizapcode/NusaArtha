import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, walletAddress: true } },
        pools: {
          include: {
            investments: { select: { id: true, tokensOwned: true } },
            outlets: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (err) {
    console.error("[GET /api/brands/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allowed fields to update via admin
    const allowed = ["riskLevel", "readinessScore", "legalDocsCID", "sopDocsCID"];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ brand });
  } catch (err) {
    console.error("[PATCH /api/brands/[id]]", err);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}
