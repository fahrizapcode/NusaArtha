import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { recordAuditEvent } from "@/lib/stellar/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const pool = await prisma.investmentPool.findUnique({
      where: { id },
      include: {
        brand: { include: { owner: true } },
        investments: { select: { id: true } },
      },
    });

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }
    if (pool.status === "PUBLISHED" || pool.status === "ACTIVE") {
      return NextResponse.json({ error: "Pool already published" }, { status: 400 });
    }

    // Upload disclosure document to IPFS
    const disclosureData = {
      poolId: id,
      poolName: pool.name,
      brandName: pool.brand.name,
      location: pool.location,
      targetFunding: pool.targetFunding,
      totalSupply: pool.totalSupply,
      pricePerToken: pool.pricePerToken,
      revenueShares: JSON.parse(pool.revenueShares),
      publishedAt: new Date().toISOString(),
      adminNote: body.note || "",
    };
    const disclosureCID = await uploadJSONToIPFS(disclosureData, `disclosure-${id}`);

    // Update pool status
    const updated = await prisma.investmentPool.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        disclosureCID,
      },
    });

    // Record audit trail on Stellar (fire-and-forget)
    recordAuditEvent("POOL_PUBLISHED", id, disclosureData).catch(console.error);

    return NextResponse.json({ pool: updated, disclosureCID });
  } catch (err) {
    console.error("[POST /api/pools/[id]/publish]", err);
    return NextResponse.json({ error: "Failed to publish pool" }, { status: 500 });
  }
}
