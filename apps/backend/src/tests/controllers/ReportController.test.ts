import { Request, Response } from "express";
import { ReportController } from "../../controllers/ReportController";
import { ReportService } from "../../services/ReportService";
import { AIAnalysisService } from "../../services/AIAnalysisService";
import { TestDataFactory } from "../utils/testHelpers";
import { container } from "tsyringe";
import fs from "fs";

// Mock dos services
jest.mock("../../services/ReportService");
jest.mock("../../services/AIAnalysisService");
jest.mock("fs");
const MockedReportService = ReportService as jest.MockedClass<
  typeof ReportService
>;
const MockedAIAnalysisService = AIAnalysisService as jest.MockedClass<
  typeof AIAnalysisService
>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("ReportController", () => {
  let reportController: ReportController;
  let mockReportService: jest.Mocked<ReportService>;
  let mockAIAnalysisService: jest.Mocked<AIAnalysisService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock fs.createReadStream
    const mockReadStream = {
      pipe: jest.fn(),
      on: jest.fn(),
    };
    mockedFs.createReadStream = jest.fn().mockReturnValue(mockReadStream);

    // Create mock services
    mockReportService = {
      generateFinancialReport: jest.fn(),
    } as any;

    mockAIAnalysisService = {
      generateInsights: jest.fn(),
      detectAnomalies: jest.fn(),
      getFinancialScore: jest.fn(),
      getRecommendations: jest.fn(),
      getTrendAnalysis: jest.fn(),
    } as any;

    // Mock the service constructors
    MockedReportService.mockImplementation(() => mockReportService);
    MockedAIAnalysisService.mockImplementation(() => mockAIAnalysisService);

    // Create controller instance with injected services
    reportController = new ReportController(
      mockReportService,
      mockAIAnalysisService
    );

    // Setup mock request/response
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: "test-user-id" },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("getInsights", () => {
    it("should get AI insights successfully", async () => {
      const mockInsights = {
        spendingInsights: [
          {
            type: "spending",
            title: "High Food Expenses",
            description: "You're spending more on food than average",
            potentialSavings: 200,
          },
        ],
        savingsInsights: [
          {
            type: "savings",
            title: "Emergency Fund Progress",
            description: "You're making good progress on your emergency fund",
            potentialSavings: 0,
          },
        ],
        goalInsights: [
          {
            type: "goal",
            title: "Goal Achievement",
            description: "You're on track to achieve your financial goals",
            potentialSavings: 0,
          },
        ],
        investmentInsights: [
          {
            type: "investment",
            title: "Portfolio Performance",
            description: "Your investments are performing well",
            potentialSavings: 0,
          },
        ],
        trendAnalysis: {
          monthlyData: [{ month: "2024-01", income: 5000, expenses: 2000 }],
          goalProgress: 0.5,
        },
      };
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockResolvedValue(
        mockInsights as any
      );

      await reportController.getInsights(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAIAnalysisService.generateInsights).toHaveBeenCalledWith(
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockInsights,
        })
      );
    });

    it("should handle get insights errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to get insights");

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockRejectedValue(error);

      await reportController.getInsights(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getFinancialScore", () => {
    it("should get financial score successfully", async () => {
      const mockInsights = {
        score: 85,
        health: "Ótima",
        insights: [],
        potentialSavings: 0,
        goalProbability: 0.8,
      };
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockResolvedValue(
        mockInsights as any
      );

      await reportController.getFinancialScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAIAnalysisService.generateInsights).toHaveBeenCalledWith(
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            score: 85,
            health: "Ótima",
          }),
        })
      );
    });

    it("should handle get financial score errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to calculate score");

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockRejectedValue(error);

      await reportController.getFinancialScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getRecommendations", () => {
    it("should get recommendations successfully", async () => {
      const mockInsights = {
        insights: [
          {
            type: "savings",
            title: "Increase Emergency Fund",
            description:
              "Consider increasing your emergency fund to 6 months of expenses",
            priority: "high",
          },
        ],
        potentialSavings: 1000,
      };
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockResolvedValue(
        mockInsights as any
      );

      await reportController.getRecommendations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAIAnalysisService.generateInsights).toHaveBeenCalledWith(
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            recommendations: mockInsights.insights,
            potentialSavings: 1000,
          }),
        })
      );
    });

    it("should handle get recommendations errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to get recommendations");

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockRejectedValue(error);

      await reportController.getRecommendations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getTrends", () => {
    it("should get trends successfully", async () => {
      const mockInsights = {
        goalProbability: 0.5,
        score: 85,
        insights: [
          {
            type: "warning",
            title: "High spending trend",
            description: "Your expenses are increasing",
          },
          {
            type: "positive",
            title: "Good savings rate",
            description: "You're saving well",
          },
        ],
      };
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockResolvedValue(
        mockInsights as any
      );

      await reportController.getTrends(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAIAnalysisService.generateInsights).toHaveBeenCalledWith(
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            goalProbability: 0.5,
            score: 85,
            trends: [
              {
                type: "warning",
                title: "High spending trend",
                description: "Your expenses are increasing",
              },
              {
                type: "positive",
                title: "Good savings rate",
                description: "You're saving well",
              },
            ],
          }),
        })
      );
    });

    it("should handle get trends errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to get trends");

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.generateInsights.mockRejectedValue(error);

      await reportController.getTrends(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAnomalies", () => {
    it("should get anomalies successfully", async () => {
      const userId = "test-user-id";
      const mockAnomalies = [
        {
          category: "Alimentação",
          currentAmount: 500,
          averageAmount: 200,
          percentageIncrease: 150,
          message: "Gasto com Alimentação está 150% acima da média",
        },
      ];

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.detectAnomalies.mockResolvedValue(mockAnomalies);

      await reportController.getAnomalies(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAIAnalysisService.detectAnomalies).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { anomalies: mockAnomalies },
        })
      );
    });

    it("should return 401 when user is not authenticated", async () => {
      mockRequest.user = undefined;

      await reportController.getAnomalies(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAIAnalysisService.detectAnomalies).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should handle get anomalies errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to detect anomalies");

      mockRequest.user = { _id: userId };
      mockAIAnalysisService.detectAnomalies.mockRejectedValue(error);

      await reportController.getAnomalies(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("generateReport", () => {
    it("should generate PDF report successfully", async () => {
      const mockReportBuffer = Buffer.from("mock-pdf-content");
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockRequest.query = { format: "pdf" };
      mockReportService.generateFinancialReport.mockResolvedValue({
        fileName: "financial-report.pdf",
        filePath: "/tmp/financial-report.pdf",
      });

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockReportService.generateFinancialReport).toHaveBeenCalledWith(
        userId,
        "month",
        "pdf"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=financial-report.pdf"
      );
      expect(mockedFs.createReadStream).toHaveBeenCalledWith(
        "/tmp/financial-report.pdf"
      );
    });

    it("should generate Excel report successfully", async () => {
      const mockReportBuffer = Buffer.from("mock-excel-content");
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockRequest.query = { format: "excel" };
      mockReportService.generateFinancialReport.mockResolvedValue({
        fileName: "financial-report.xlsx",
        filePath: "/tmp/financial-report.xlsx",
      });

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockReportService.generateFinancialReport).toHaveBeenCalledWith(
        userId,
        "month",
        "excel"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=financial-report.xlsx"
      );
      expect(mockedFs.createReadStream).toHaveBeenCalledWith(
        "/tmp/financial-report.xlsx"
      );
    });

    it("should handle generate report errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Report generation failed");

      mockRequest.user = { _id: userId };
      mockRequest.query = { format: "pdf" };
      mockReportService.generateFinancialReport.mockRejectedValue(error);

      await reportController.generateReport(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
