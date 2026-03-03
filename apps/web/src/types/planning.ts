export interface BudgetAllocation {
  needs: number;
  wants: number;
  savings: number;
}

export interface SuggestedGoal {
  name: string;
  targetAmount: number;
  suggestedMonths: number;
  priority: "high" | "medium" | "low";
  description?: string;
}

export interface PlanMilestone {
  month: number;
  description: string;
  targetAmount: number;
  isCheckpoint: boolean;
}

export interface FinancialPlan {
  allocation: BudgetAllocation;
  monthlyIncome: number;
  suggestedMonthlySavings: number;
  suggestedGoals: SuggestedGoal[];
  milestones: PlanMilestone[];
  message: string;
}

export interface SimulationResult {
  savingsPercent: number;
  months: number;
  monthlyIncome: number;
  totalSaved: number;
  byMonth: { month: number; accumulated: number }[];
}

export interface AdherenceResult {
  currentAllocation: BudgetAllocation;
  targetAllocation: BudgetAllocation;
  adherenceScore: number;
  message: string;
  suggestions: string[];
}
