/**
 * Alocação do orçamento (ex.: regra 50/30/20)
 */
export interface IBudgetAllocation {
  needs: number;   // % para necessidades
  wants: number;   // % para desejos
  savings: number; // % para poupança/investimentos
}

/**
 * Meta sugerida pelo plano
 */
export interface ISuggestedGoal {
  name: string;
  targetAmount: number;
  suggestedMonths: number;
  priority: "high" | "medium" | "low";
  description?: string;
}

/**
 * Marco do cronograma
 */
export interface IPlanMilestone {
  month: number;
  description: string;
  targetAmount: number;
  isCheckpoint: boolean;
}

/**
 * Plano financeiro personalizado
 */
export interface IFinancialPlan {
  allocation: IBudgetAllocation;
  monthlyIncome: number;
  suggestedMonthlySavings: number;
  suggestedGoals: ISuggestedGoal[];
  milestones: IPlanMilestone[];
  message: string;
}

/**
 * Resultado do simulador de cenário
 */
export interface ISimulationResult {
  savingsPercent: number;
  months: number;
  monthlyIncome: number;
  totalSaved: number;
  byMonth: { month: number; accumulated: number }[];
}

/**
 * Aderência ao plano
 */
export interface IAdherenceResult {
  currentAllocation: IBudgetAllocation;
  targetAllocation: IBudgetAllocation;
  adherenceScore: number; // 0-100
  message: string;
  suggestions: string[];
}

export interface IFinancialPlanningService {
  /**
   * Gera plano financeiro personalizado (50/30/20 ou baseado em dados reais)
   */
  getPlan(userId: string): Promise<IFinancialPlan>;

  /**
   * Simula cenário: "e se eu poupar X% por Y meses?"
   */
  simulateScenario(
    userId: string,
    savingsPercent: number,
    months: number
  ): Promise<ISimulationResult>;

  /**
   * Retorna aderência atual ao plano (comparação real vs. alvo)
   */
  getAdherence(userId: string): Promise<IAdherenceResult>;
}
