export interface Investment {
  _id: string;
  name: string;
  type: 'stock' | 'bond' | 'fund' | 'crypto' | 'cash' | 'other';
  ticker?: string;
  institution: string;
  investedValue: number;
  currentValue: number;
  profitability: number;
  acquisitionDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentCreateData {
  name: string;
  type: 'stock' | 'bond' | 'fund' | 'crypto' | 'cash' | 'other';
  ticker?: string;
  institution: string;
  investedValue: number;
  currentValue?: number;
  acquisitionDate: string;
  notes?: string;
}

export interface InvestmentUpdateData {
  name?: string;
  ticker?: string;
  institution?: string;
  investedValue?: number;
  currentValue?: number;
  notes?: string;
}

export interface InvestmentSummary {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  assetCount: number;
  assetAllocation: AssetAllocation[];
}

export interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
}

export interface InvestmentPerformance {
  period: 'month' | 'quarter' | 'year';
  performanceData: PerformanceData[];
}

export interface PerformanceData {
  date: string;
  value: number;
  change: number;
}

export type InvestmentProfile = "conservador" | "moderado" | "arrojado";

export interface AllocationSuggestion {
  assetClass: string;
  percentage: number;
  description: string;
  examples?: string[];
}

export interface InvestmentRecommendation {
  profile: InvestmentProfile;
  allocation: AllocationSuggestion[];
  message: string;
  opportunityIndicators: string[];
  suggestedMonthlyAmount?: number;
}