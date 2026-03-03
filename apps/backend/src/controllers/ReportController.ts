import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IReportService } from "../interfaces/services/IReportService";
import { IAIAnalysisService } from "../interfaces/services/IAIAnalysisService";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import fs from "fs";

@injectable()
export class ReportController {
  constructor(
    @inject("ReportService")
    private reportService: IReportService,
    @inject("AIAnalysisService")
    private aiAnalysisService: IAIAnalysisService
  ) {}

  /**
   * Generate financial report
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the report is generated
   */
  generateReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const period =
        (req.query.period as "month" | "quarter" | "year") || "month";
      const format = (req.query.format as "pdf" | "excel") || "pdf";

      const result = await this.reportService.generateFinancialReport(
        (req.user as any)._id,
        period,
        format
      );

      // Set appropriate headers for download
      res.setHeader(
        "Content-Type",
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${result.fileName}`
      );

      // Send file
      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);

      // Clean up file after sending
      fileStream.on("end", () => {
        fs.unlinkSync(result.filePath);
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get AI insights
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the insights are retrieved
   */
  getInsights = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const insights = await this.aiAnalysisService.generateInsights(
        (req.user as any)._id
      );

      ApiResponse.success(res, insights, "Insights de IA gerados com sucesso");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get financial score only
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the financial score is retrieved
   */
  getFinancialScore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const insights = await this.aiAnalysisService.generateInsights(
        (req.user as any)._id
      );

      ApiResponse.success(
        res,
        {
          score: insights.score,
          health: insights.health,
        },
        "Score financeiro obtido com sucesso"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get personalized recommendations
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the recommendations are retrieved
   */
  getRecommendations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const insights = await this.aiAnalysisService.generateInsights(
        (req.user as any)._id
      );

      ApiResponse.success(
        res,
        {
          recommendations: insights.insights,
          potentialSavings: insights.potentialSavings,
        },
        "Recomendações obtidas com sucesso"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get financial trends
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the trends are retrieved
  */
  getTrends = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const insights = await this.aiAnalysisService.generateInsights(
        (req.user as any)._id
      );

      ApiResponse.success(
        res,
        {
          goalProbability: insights.goalProbability,
          score: insights.score,
          trends: insights.insights.filter(
            (insight) =>
              insight.type === "warning" || insight.type === "positive"
          ),
        },
        "Tendências financeiras obtidas com sucesso"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Detecta gastos atípicos (anomalias) em relação ao histórico
   */
  getAnomalies = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const anomalies = await this.aiAnalysisService.detectAnomalies(
        (req.user as any)._id
      );

      ApiResponse.success(
        res,
        { anomalies },
        "Anomalias analisadas com sucesso"
      );
    } catch (error) {
      next(error);
    }
  };
}
