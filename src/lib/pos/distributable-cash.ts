// src/lib/pos/distributable-cash.ts

export type PosRevenueData = {
  grossRevenue: number;
  cogs: number; // Cost of Goods Sold (HPP)
  operatorCosts: number; // Gaji & biaya operator
  rentAndUtilities: number; // Sewa & utilitas
  taxes: number; // Pajak
  maintenanceCosts: number; // Biaya pemeliharaan
  reserveFundContribution: number; // Pengisian reserve
  platformMonitoringFee: number; // Platform fee
};

export type DistributableCashResult = {
  distributableCash: number;
  allocations: {
    investor: number;
    brandOwner: number;
    operator: number;
    platform: number;
  };
};

/**
 * Calculates the total distributable cash and allocates it according to the waterfall structure
 * defined in the tokenomics section of the PRD.
 */
export function calculateDistributableCash(
  data: PosRevenueData,
  shares: { investor: number; brand: number; operator: number; platform: number } = { investor: 40, brand: 30, operator: 20, platform: 10 }
): DistributableCashResult {
  
  // Calculate total expenses
  const totalExpenses = 
    data.cogs + 
    data.operatorCosts + 
    data.rentAndUtilities + 
    data.taxes + 
    data.maintenanceCosts + 
    data.reserveFundContribution + 
    data.platformMonitoringFee;
    
  // Distributable cash is revenue minus all expenses
  const distributableCash = Math.max(0, data.grossRevenue - totalExpenses);
  
  // Allocate according to shares (percentages)
  const allocations = {
    investor: (distributableCash * shares.investor) / 100,
    brandOwner: (distributableCash * shares.brand) / 100,
    operator: (distributableCash * shares.operator) / 100,
    platform: (distributableCash * shares.platform) / 100,
  };
  
  return {
    distributableCash,
    allocations
  };
}
