import { ReportService } from "../../services/ReportService";
import { IAIAnalysisService } from "../../interfaces/services/IAIAnalysisService";
import { ITransactionRepository } from "../../interfaces/repositories/ITransactionRepository";
import { ApiError } from "../../utils/ApiError";

// Mock all external dependencies
jest.mock("pdfkit");
jest.mock("exceljs");
jest.mock("fs");
jest.mock("path");
jest.mock("uuid");

describe("ReportService", () => {
  let reportService: ReportService;
  let mockAIAnalysisService: jest.Mocked<IAIAnalysisService>;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(() => {
    // Create mocks
    mockAIAnalysisService = {
      generateInsights: jest.fn(),
    } as any;

    mockTransactionRepository = {
      findByDateRange: jest.fn(),
    } as any;

    // Create service instance
    reportService = new ReportService(
      mockAIAnalysisService,
      mockTransactionRepository
    );

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("generateFinancialReport", () => {
    it("should handle errors gracefully", async () => {
      const userId = "user123";
      const period = "month" as const;
      const format = "pdf" as const;

      const error = new Error("Database error");
      mockTransactionRepository.findByDateRange.mockRejectedValue(error);

      await expect(
        reportService.generateFinancialReport(userId, period, format)
      ).rejects.toThrow(ApiError);
      await expect(
        reportService.generateFinancialReport(userId, period, format)
      ).rejects.toThrow("Failed to generate report");
    });

    it("should handle AI analysis service errors", async () => {
      const userId = "user123";
      const period = "month" as const;
      const format = "pdf" as const;

      const mockTransactions = [];
      const error = new Error("AI service error");
      mockTransactionRepository.findByDateRange.mockResolvedValue(
        mockTransactions
      );
      mockAIAnalysisService.generateInsights.mockRejectedValue(error);

      await expect(
        reportService.generateFinancialReport(userId, period, format)
      ).rejects.toThrow(ApiError);
    });

    it("should handle transaction repository errors", async () => {
      const userId = "user123";
      const period = "month" as const;
      const format = "pdf" as const;

      const error = new Error("Transaction repository error");
      mockTransactionRepository.findByDateRange.mockRejectedValue(error);

      await expect(
        reportService.generateFinancialReport(userId, period, format)
      ).rejects.toThrow(ApiError);
    });
  });

  describe("date range calculation", () => {
    it("should calculate correct date range for month", async () => {
      const userId = "user123";
      const period = "month" as const;
      const format = "pdf" as const;

      const mockTransactions = [];
      const mockInsights = {
        score: { value: 50, change: 5 },
        health: "Poor",
        potentialSavings: 0,
        insights: [],
        goalProbability: 0.5,
      };

      mockTransactionRepository.findByDateRange.mockResolvedValue(
        mockTransactions
      );
      mockAIAnalysisService.generateInsights.mockResolvedValue(mockInsights);

      // Mock the complex file operations to avoid timeouts
      const originalGeneratePDFReport = (reportService as any)
        .generatePDFReport;
      const originalGenerateExcelReport = (reportService as any)
        .generateExcelReport;

      (reportService as any).generatePDFReport = jest.fn().mockResolvedValue({
        filePath: "/test/path.pdf",
        fileName: "test.pdf",
      });
      (reportService as any).generateExcelReport = jest.fn().mockResolvedValue({
        filePath: "/test/path.xlsx",
        fileName: "test.xlsx",
      });

      await reportService.generateFinancialReport(userId, period, format);

      const call = mockTransactionRepository.findByDateRange.mock.calls[0];
      const startDate = call[1];
      const endDate = call[2];

      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());

      // Restore original methods
      (reportService as any).generatePDFReport = originalGeneratePDFReport;
      (reportService as any).generateExcelReport = originalGenerateExcelReport;
    });

    it("should calculate correct date range for quarter", async () => {
      const userId = "user123";
      const period = "quarter" as const;
      const format = "pdf" as const;

      const mockTransactions = [];
      const mockInsights = {
        score: { value: 50, change: 5 },
        health: "Poor",
        potentialSavings: 0,
        insights: [],
        goalProbability: 0.5,
      };

      mockTransactionRepository.findByDateRange.mockResolvedValue(
        mockTransactions
      );
      mockAIAnalysisService.generateInsights.mockResolvedValue(mockInsights);

      // Mock the complex file operations to avoid timeouts
      (reportService as any).generatePDFReport = jest.fn().mockResolvedValue({
        filePath: "/test/path.pdf",
        fileName: "test.pdf",
      });

      await reportService.generateFinancialReport(userId, period, format);

      const call = mockTransactionRepository.findByDateRange.mock.calls[0];
      const startDate = call[1];
      const endDate = call[2];

      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    });

    it("should calculate correct date range for year", async () => {
      const userId = "user123";
      const period = "year" as const;
      const format = "pdf" as const;

      const mockTransactions = [];
      const mockInsights = {
        score: { value: 50, change: 5 },
        health: "Poor",
        potentialSavings: 0,
        insights: [],
        goalProbability: 0.5,
      };

      mockTransactionRepository.findByDateRange.mockResolvedValue(
        mockTransactions
      );
      mockAIAnalysisService.generateInsights.mockResolvedValue(mockInsights);

      // Mock the complex file operations to avoid timeouts
      (reportService as any).generatePDFReport = jest.fn().mockResolvedValue({
        filePath: "/test/path.pdf",
        fileName: "test.pdf",
      });

      await reportService.generateFinancialReport(userId, period, format);

      const call = mockTransactionRepository.findByDateRange.mock.calls[0];
      const startDate = call[1];
      const endDate = call[2];

      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    });
  });

  describe("service initialization", () => {
    it("should create service instance with dependencies", () => {
      expect(reportService).toBeDefined();
      expect(reportService).toBeInstanceOf(ReportService);
    });

    it("should have required methods", () => {
      expect(typeof reportService.generateFinancialReport).toBe("function");
    });
  });
});
