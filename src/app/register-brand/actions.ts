"use server";

import prisma from "@/lib/prisma";
import { calculateBrandReadiness } from "@/lib/scoring/brand-readiness";
import { uploadJSONToIPFS } from "@/lib/ipfs";
import { recordAuditEvent } from "@/lib/stellar/audit";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

export async function submitBrandRegistration(data: any) {
  try {
    const walletAddress: string | undefined = data.walletAddress;

    // 1. Get logged in user from JWT
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    let ownerId: string | null = null;
    let owner: any = null;

    if (token) {
      const payload = await verifyJwt(token);
      if (payload && payload.id) {
        ownerId = payload.id as string;
        owner = await prisma.user.findUnique({ where: { id: ownerId } });
      }
    }

    if (!owner) {
      // Fallback: Resolve or create owner by walletAddress
      owner = walletAddress
        ? await prisma.user.findFirst({ where: { walletAddress } })
        : null;

      if (!owner) {
        // Try to find by email slug
        const emailSlug = data.ownerName
          ? `${data.ownerName.replace(/\s+/g, "").toLowerCase()}@nusaartha.id`
          : `brand-${Date.now()}@nusaartha.id`;

        owner = await prisma.user.findFirst({ where: { email: emailSlug } });

        if (!owner) {
          owner = await prisma.user.create({
            data: {
              walletAddress: walletAddress || `STELLAR_${Date.now()}`,
              role: "BRAND_OWNER",
              email: emailSlug,
              name: data.ownerName || "Brand Owner",
            },
          });
        }
      }
    }

    // 2. Check if this owner already has a brand
    const existing = await prisma.brand.findFirst({ where: { ownerId: owner.id } });
    if (existing) {
      return { success: false, error: "Wallet ini sudah memiliki brand yang terdaftar." };
    }

    // 3. Upload data to IPFS for immutability
    const cid = await uploadJSONToIPFS(
      { ...data, submittedAt: new Date().toISOString() },
      `brand-registration-${owner.id}`
    );

    // 4. Calculate Brand Readiness Score
    const assessmentResult = calculateBrandReadiness({
      hasActiveOutlets: parseInt(data.outletCount || "0") > 0,
      revenueStabilityScore:
        parseInt(data.monthlyRevenue?.replace(/\D/g, "") || "0") > 50_000_000 ? 80 : 40,
      sopCompletenessScore: data.hasSOP === "Ya" ? 90 : 20,
      productMarginScore: 70,
      supplyChainReadinessScore:
        (data.supplyChain || "").length > 20 ? 80 : 30,
      capitalFeasibilityScore: 75,
      replicabilityScore: 80,
      hasCompleteLegality: !!(data.nib && data.nib.length > 5),
      qualityStandardScore:
        (data.qualityStandard || "").length > 20 ? 85 : 40,
    });

    // 5. Save brand to DB
    const brand = await prisma.brand.create({
      data: {
        ownerId: owner.id,
        name: data.brandName,
        businessType: data.businessType,
        readinessScore: assessmentResult.score,
        riskLevel: assessmentResult.level,
        legalDocsCID: cid,
        sopDocsCID: data.hasSOP === "Ya" ? cid : null,
      },
    });

    // 6. Record audit event on Stellar (fire-and-forget)
    recordAuditEvent("BRAND_APPROVED", brand.id, {
      brandName: brand.name,
      score: assessmentResult.score,
      level: assessmentResult.level,
      ipfsCID: cid,
    }).catch(console.error);

    return {
      success: true,
      brandId: brand.id,
      score: assessmentResult.score,
      level: assessmentResult.level,
      notes: assessmentResult.notes,
    };
  } catch (error) {
    console.error("Failed to register brand:", error);
    return { success: false, error: "Gagal mendaftarkan brand. Coba lagi." };
  }
}
