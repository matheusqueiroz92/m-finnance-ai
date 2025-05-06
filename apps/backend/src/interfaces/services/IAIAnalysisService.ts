import { IFinancialInsights } from '../entities/IReport';

export interface IAIAnalysisService {
  generateInsights(userId: string): Promise<IFinancialInsights>;
}