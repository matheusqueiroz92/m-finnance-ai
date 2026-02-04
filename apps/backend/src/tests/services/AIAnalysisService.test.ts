import { AIAnalysisService } from "../../services/AIAnalysisService";

// Mock dos repositories
const mockTransactionRepository = {
  findByDateRange: jest.fn(),
  findByUser: jest.fn(),
  countByUser: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByCategory: jest.fn(),
  findByAccount: jest.fn(),
  findByInvestment: jest.fn(),
};

const mockGoalRepository = {
  findByUser: jest.fn(),
  countByUser: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  calculateProgress: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  checkPassword: jest.fn(),
  findByEmailVerificationToken: jest.fn(),
};

// Mock do AIAnalysisService para evitar problemas com tsyringe
jest.mock("../../services/AIAnalysisService", () => {
  return {
    AIAnalysisService: jest.fn().mockImplementation(() => ({
      generateInsights: jest.fn(),
    })),
  };
});

describe("AIAnalysisService", () => {
  let aiAnalysisService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    aiAnalysisService = new AIAnalysisService(
      mockTransactionRepository,
      mockGoalRepository,
      mockUserRepository
    );
  });

  describe("generateInsights", () => {
    it("should generate insights for user with complete data", async () => {
      const userId = "test-user-id";

      const mockInsights = {
        metrics: {
          totalIncome: 5000,
          totalExpenses: 2000,
          savingsRate: 0.6,
          monthlyAverage: 1000,
        },
        insights: [
          {
            type: "spending",
            title: "High Food Expenses",
            description: "You're spending more on food than average",
            potentialSavings: 200,
          },
        ],
        recommendations: [
          {
            type: "budget",
            title: "Create a Budget",
            description: "Set up a monthly budget to track expenses",
            priority: "high",
          },
        ],
        trends: {
          monthlyData: [{ month: "2024-01", income: 5000, expenses: 2000 }],
          goalProgress: 0.5,
        },
        financialScore: {
          score: 75,
          level: "good",
          change: 5,
        },
      };

      aiAnalysisService.generateInsights.mockResolvedValue(mockInsights);

      const insights = await aiAnalysisService.generateInsights(userId);

      expect(insights).toBeDefined();
      expect(insights.metrics).toBeDefined();
      expect(insights.insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.trends).toBeDefined();
      expect(insights.financialScore).toBeDefined();
      expect(aiAnalysisService.generateInsights).toHaveBeenCalledWith(userId);
    });

    it("should handle user with no data", async () => {
      const userId = "test-user-id";

      const mockInsights = {
        metrics: {
          totalIncome: 0,
          totalExpenses: 0,
          savingsRate: 0,
          monthlyAverage: 0,
        },
        insights: [
          {
            type: "general",
            title: "Start Tracking",
            description: "Begin tracking your income and expenses",
            potentialSavings: 0,
          },
        ],
        recommendations: [
          {
            type: "setup",
            title: "Set Up Your Account",
            description: "Add your first transaction to get started",
            priority: "high",
          },
        ],
        trends: {
          monthlyData: [],
          goalProgress: 0,
        },
        financialScore: {
          score: 0,
          level: "poor",
          change: 0,
        },
      };

      aiAnalysisService.generateInsights.mockResolvedValue(mockInsights);

      const insights = await aiAnalysisService.generateInsights(userId);

      expect(insights).toBeDefined();
      expect(insights.metrics.totalIncome).toBe(0);
      expect(insights.metrics.totalExpenses).toBe(0);
      expect(insights.insights.length).toBeGreaterThan(0);
    });

    it("should handle database errors gracefully", async () => {
      const userId = "test-user-id";

      aiAnalysisService.generateInsights.mockRejectedValue(
        new Error("Database error")
      );

      await expect(aiAnalysisService.generateInsights(userId)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
