import { IFinancialInsights } from '../entities/IReport';

export interface IAnomaly {
  category: string;
  currentAmount: number;
  averageAmount: number;
  percentageIncrease: number;
  message: string;
}

export interface IAIAnalysisService {
  generateInsights(userId: string): Promise<IFinancialInsights>;

  /**
   * Detecta gastos atípicos em relação ao padrão histórico
   * @param userId - ID do usuário
   * @returns Lista de anomalias detectadas (gastos acima do habitual)
   */
  detectAnomalies(userId: string): Promise<IAnomaly[]>;
}

export interface IAnalysisMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoryExpenses: Record<string, number>;
}