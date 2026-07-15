// src/lib/scoring/outlet-performance.ts
// Outlet Performance Score calculator

export type OutletPerformanceData = {
  revenueVsTargetScore: number;   // 0–100: pencapaian omzet vs target
  growthTrendScore: number;       // 0–100: tren pertumbuhan MoM
  operationalCostRatioScore: number; // 0–100: efisiensi biaya (low = better)
  transactionVolumeScore: number; // 0–100: jumlah transaksi harian
  sopComplianceScore: number;     // 0–100: kepatuhan SOP audit
  customerRetentionScore: number; // 0–100: repeat customer rate
};

export type OutletScoreResult = {
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  status: "Excellent" | "Good" | "Average" | "Below Average" | "Critical";
  notes: string[];
  bepEstimate: string; // estimasi BEP berdasarkan performa
  riskFlag: boolean;   // apakah outlet berisiko tinggi
};

/**
 * Menghitung Outlet Performance Score dari data POS aktual.
 */
export function calculateOutletPerformance(
  data: OutletPerformanceData
): OutletScoreResult {
  const notes: string[] = [];

  const weights = {
    revenueVsTargetScore: 0.30,
    growthTrendScore: 0.20,
    operationalCostRatioScore: 0.15,
    transactionVolumeScore: 0.20,
    sopComplianceScore: 0.10,
    customerRetentionScore: 0.05,
  };

  const score = Math.round(
    data.revenueVsTargetScore * weights.revenueVsTargetScore +
    data.growthTrendScore * weights.growthTrendScore +
    data.operationalCostRatioScore * weights.operationalCostRatioScore +
    data.transactionVolumeScore * weights.transactionVolumeScore +
    data.sopComplianceScore * weights.sopComplianceScore +
    data.customerRetentionScore * weights.customerRetentionScore
  );

  if (data.revenueVsTargetScore < 60) notes.push("Omzet belum mencapai target — evaluasi strategi pemasaran.");
  if (data.growthTrendScore < 40) notes.push("Tren pertumbuhan negatif atau stagnan — perlu analisis lebih lanjut.");
  if (data.operationalCostRatioScore < 50) notes.push("Rasio biaya operasional terlalu tinggi — perlu efisiensi.");
  if (data.transactionVolumeScore < 50) notes.push("Volume transaksi rendah — pertimbangkan promosi atau variasi menu.");

  let grade: OutletScoreResult["grade"];
  let status: OutletScoreResult["status"];

  if (score >= 85) { grade = "A"; status = "Excellent"; }
  else if (score >= 70) { grade = "B"; status = "Good"; }
  else if (score >= 55) { grade = "C"; status = "Average"; }
  else if (score >= 40) { grade = "D"; status = "Below Average"; }
  else { grade = "F"; status = "Critical"; }

  // Rough BEP estimation based on performance
  let bepEstimate: string;
  if (score >= 85) bepEstimate = "< 12 bulan";
  else if (score >= 70) bepEstimate = "12–18 bulan";
  else if (score >= 55) bepEstimate = "18–24 bulan";
  else bepEstimate = "> 24 bulan (perlu evaluasi)";

  return {
    score,
    grade,
    status,
    notes,
    bepEstimate,
    riskFlag: score < 45,
  };
}
