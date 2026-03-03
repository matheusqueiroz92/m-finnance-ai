import { IFinancialInsights } from '../entities/IReport';

export interface IAnomaly {
  category: string;
  currentAmount: number;
  averageAmount: number;
  percentageIncrease: number;
  message: string;
}

export interface ISpendingPattern {
  pattern: string;
  category?: string;
  dayOfWeek: number; // 0=domingo, 6=sábado
  dayName: string;
  averageAmount: number;
  transactionCount: number;
  description: string;
}

export interface IAIAnalysisService {
  generateInsights(userId: string): Promise<IFinancialInsights>;

  /**
   * Detecta gastos atípicos em relação ao padrão histórico
   * @param userId - ID do usuário
   * @returns Lista de anomalias detectadas (gastos acima do habitual)
   */
  detectAnomalies(userId: string): Promise<IAnomaly[]>;

  /**
   * Identifica padrões de consumo (ex.: gastos às sextas-feiras)
   * @param userId - ID do usuário
   * @returns Padrões identificados por dia da semana e categoria
   */
  detectSpendingPatterns(userId: string): Promise<ISpendingPattern[]>;
}

export interface IAnalysisMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoryExpenses: Record<string, number>;
}