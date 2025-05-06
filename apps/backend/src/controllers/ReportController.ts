import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { ReportService } from '../services/ReportService';
import { AIAnalysisService } from '../services/AIAnalysisService';

export class ReportController {
  private reportService: ReportService;
  private aiAnalysisService: AIAnalysisService;
  
  constructor() {
    this.reportService = new ReportService();
    this.aiAnalysisService = new AIAnalysisService();
  }
  
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
      
      res.status(200).json({
        success: true,
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  };
}