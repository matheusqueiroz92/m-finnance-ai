import { IFinancialInsights } from '../entities/IReport';

export interface IAIAnalysisService {
  generateInsights(userId: string): Promise<IFinancialInsights>;
}

export interface IAnalysisMetrics {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoryExpenses: Record<string, number>;
}