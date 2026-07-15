// src/lib/scoring/operator-performance.ts
// Operator Performance Score calculator

export type OperatorPerformanceData = {
  salesScore: number;         // 0–100: pencapaian vs target penjualan
  sopComplianceScore: number; // 0–100: kepatuhan SOP (audit visit)
  stockAccuracyScore: number; // 0–100: akurasi laporan stok
  reportConsistencyScore: number; // 0–100: konsistensi laporan harian
  customerReviewScore: number;    // 0–100: skor ulasan pelanggan
  operationalEfficiencyScore: number; // 0–100: efisiensi biaya operasional
};

export type OperatorScoreResult = {
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  status: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Pembinaan" | "Tidak Memenuhi Standar";
  notes: string[];
  eligibleForOwnership: boolean; // apakah eligible Operator-to-Ownership
};

/**
 * Menghitung Operator Performance Score berdasarkan 6 komponen.
 * Bobot mengacu pada plan: penjualan, SOP, stok, laporan, review, efisiensi.
 */
export function calculateOperatorPerformance(
  data: OperatorPerformanceData
): OperatorScoreResult {
  const notes: string[] = [];

  // Bobot masing-masing komponen
  const weights = {
    salesScore: 0.30,
    sopComplianceScore: 0.25,
    stockAccuracyScore: 0.15,
    reportConsistencyScore: 0.10,
    customerReviewScore: 0.12,
    operationalEfficiencyScore: 0.08,
  };

  const score = Math.round(
    data.salesScore * weights.salesScore +
    data.sopComplianceScore * weights.sopComplianceScore +
    data.stockAccuracyScore * weights.stockAccuracyScore +
    data.reportConsistencyScore * weights.reportConsistencyScore +
    data.customerReviewScore * weights.customerReviewScore +
    data.operationalEfficiencyScore * weights.operationalEfficiencyScore
  );

  if (data.salesScore < 60) notes.push("Pencapaian penjualan masih di bawah target — perlu evaluasi strategi.");
  if (data.sopComplianceScore < 70) notes.push("Kepatuhan SOP perlu ditingkatkan — lakukan coaching lebih lanjut.");
  if (data.stockAccuracyScore < 70) notes.push("Akurasi laporan stok rendah — perlu pelatihan manajemen inventori.");
  if (data.reportConsistencyScore < 70) notes.push("Laporan harian tidak konsisten — ingatkan kewajiban pelaporan.");
  if (data.customerReviewScore < 60) notes.push("Skor ulasan pelanggan rendah — perbaiki kualitas pelayanan.");

  let grade: OperatorScoreResult["grade"];
  let status: OperatorScoreResult["status"];

  if (score >= 85) { grade = "A"; status = "Sangat Baik"; }
  else if (score >= 75) { grade = "B"; status = "Baik"; }
  else if (score >= 60) { grade = "C"; status = "Cukup"; }
  else if (score >= 45) { grade = "D"; status = "Perlu Pembinaan"; }
  else { grade = "F"; status = "Tidak Memenuhi Standar"; }

  return {
    score,
    grade,
    status,
    notes,
    eligibleForOwnership: score >= 75,
  };
}
