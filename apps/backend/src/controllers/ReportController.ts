import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IReportService } from '../interfaces/services/IReportService';
import { IAIAnalysisService } from '../interfaces/services/IAIAnalysisService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import fs from 'fs';

@injectable()
export class ReportController {
  constructor(
    @inject('ReportService')
    private reportService: IReportService,
    @inject('AIAnalysisService')
    private aiAnalysisService: IAIAnalysisService
  ) {}
  
  /**
   * Generate financial report
   */
  generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';
      const format = (req.query.format as 'pdf' | 'excel') || 'pdf';
      
      const result = await this.reportService.generateFinancialReport(
        req.user._id,
        period,
        format
      );
      
      // Set appropriate headers for download
      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
      
      // Send file
      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);
      
      // Clean up file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(result.filePath);
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get AI insights
   */
  getInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insights = await this.aiAnalysisService.generateInsights(req.user._id);
      
      ApiResponse.success(res, insights, 'Insights de IA gerados com sucesso');
    } catch (error) {
      next(error);
    }
  };
}