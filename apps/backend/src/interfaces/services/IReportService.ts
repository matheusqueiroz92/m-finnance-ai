import { IReportFileResult, IFinancialInsights } from '../entities/IReport';

export interface IReportService {
  generateFinancialReport(
    userId: string,
    period: 'month' | 'quarter' | 'year',
    format: 'pdf' | 'excel'
  ): Promise<IReportFileResult>;
}