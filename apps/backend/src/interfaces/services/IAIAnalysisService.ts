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

export interface IExpenseForecast {
  predictedTotal: number;
  byCategory: Record<string, number>;
  confidence: number; // 0-1
  basedOnMonths: number;
  nextMonth: string; // YYYY-MM
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

  /**
   * Previsão de gastos do próximo mês baseada em séries temporais
   * @param userId - ID do usuário
   * @returns Previsão com valor total e por categoria
   */
  forecastNextMonthExpenses(userId: string): Promise<IExpenseForecast>;
}

export interface IAnalysisMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoryExpenses: Record<string, number>;
}