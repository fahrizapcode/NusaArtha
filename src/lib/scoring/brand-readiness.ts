// src/lib/scoring/brand-readiness.ts

export type BrandAssessmentData = {
  hasActiveOutlets: boolean;
  revenueStabilityScore: number; // 0-100
  sopCompletenessScore: number; // 0-100
  productMarginScore: number; // 0-100
  supplyChainReadinessScore: number; // 0-100
  capitalFeasibilityScore: number; // 0-100
  replicabilityScore: number; // 0-100
  hasCompleteLegality: boolean;
  qualityStandardScore: number; // 0-100
};

export type AssessmentResult = {
  score: number;
  status: "Layak Lanjut" | "Perlu Revisi" | "Tidak Layak";
  level: "EMERGING" | "MEZZANINE" | "MATURE" | "HIGH_RISK";
  notes: string[];
};

/**
 * Calculates the Brand Readiness Score based on the PRD criteria
 */
export function calculateBrandReadiness(data: BrandAssessmentData): AssessmentResult {
  const notes: string[] = [];
  let score = 0;

  // 1. Outlet aktif (15%)
  if (data.hasActiveOutlets) {
    score += 15;
  } else {
    notes.push("Brand belum memiliki outlet aktif yang terbukti berjalan.");
  }

  // 2. Stabilitas omzet (15%)
  score += (data.revenueStabilityScore / 100) * 15;
  if (data.revenueStabilityScore < 50) notes.push("Omzet belum cukup stabil untuk ekspansi.");

  // 3. Kelengkapan SOP (15%)
  score += (data.sopCompletenessScore / 100) * 15;
  if (data.sopCompletenessScore < 70) notes.push("Dokumen SOP operasional perlu dilengkapi.");

  // 4. Margin produk (10%)
  score += (data.productMarginScore / 100) * 10;
  
  // 5. Kesiapan supply chain (10%)
  score += (data.supplyChainReadinessScore / 100) * 10;

  // 6. Kelayakan modal (10%)
  score += (data.capitalFeasibilityScore / 100) * 10;

  // 7. Replikabilitas bisnis (10%)
  score += (data.replicabilityScore / 100) * 10;

  // 8. Legalitas lengkap (10%)
  if (data.hasCompleteLegality) {
    score += 10;
  } else {
    notes.push("Dokumen legalitas wajib dilengkapi (NIB, NPWP).");
  }

  // 9. Standar kualitas (5%)
  score += (data.qualityStandardScore / 100) * 5;

  score = Math.round(score);

  // Determine Level and Status
  let level: "EMERGING" | "MEZZANINE" | "MATURE" | "HIGH_RISK" = "HIGH_RISK";
  let status: "Layak Lanjut" | "Perlu Revisi" | "Tidak Layak" = "Tidak Layak";

  if (!data.hasCompleteLegality || data.revenueStabilityScore < 30) {
    level = "HIGH_RISK";
    status = "Tidak Layak";
  } else if (score >= 80) {
    level = "MATURE";
    status = "Layak Lanjut";
  } else if (score >= 60) {
    level = "MEZZANINE";
    status = "Layak Lanjut";
  } else if (score >= 40) {
    level = "EMERGING";
    status = "Perlu Revisi";
  } else {
    level = "HIGH_RISK";
    status = "Tidak Layak";
  }

  return {
    score,
    status,
    level,
    notes
  };
}
