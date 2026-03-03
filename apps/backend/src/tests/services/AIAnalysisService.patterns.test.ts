import { AIAnalysisService } from "../../services/AIAnalysisService";
import { ISpendingPattern } from "../../interfaces/services/IAIAnalysisService";

jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

const mockFindByDateRange = jest.fn();

const mockTransactionRepository = {
  findByDateRange: mockFindByDateRange,
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

describe("AIAnalysisService - detectSpendingPatterns", () => {
  let aiAnalysisService: AIAnalysisService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-03-15"));
    jest.clearAllMocks();
    aiAnalysisService = new AIAnalysisService(
      mockTransactionRepository as any,
      mockGoalRepository as any,
      mockUserRepository as any
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createExpense = (amount: number, categoryName: string, dayOfWeek: number) => {
    const date = new Date("2025-03-02");
    date.setDate(date.getDate() + dayOfWeek);
    return {
      _id: "tx-id",
      type: "expense" as const,
      amount,
      date,
      category: { _id: "cat-id", name: categoryName },
      user: "user-id",
      account: {},
      description: "test",
      isRecurring: false,
    };
  };

  it("deve retornar array vazio quando não há transações", async () => {
    mockFindByDateRange.mockResolvedValue([]);

    const result = await aiAnalysisService.detectSpendingPatterns("user-1");

    expect(result).toEqual([]);
  });

  it("deve identificar padrões por dia da semana", async () => {
    const transactions = [
      createExpense(50, "Alimentação", 0),
      createExpense(50, "Alimentação", 1),
      createExpense(300, "Alimentação", 5),
      createExpense(300, "Transporte", 5),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.detectSpendingPatterns("user-1");

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({
      pattern: expect.any(String),
      dayName: expect.any(String),
      dayOfWeek: expect.any(Number),
      averageAmount: expect.any(Number),
      transactionCount: expect.any(Number),
      description: expect.any(String),
    });
    const topPattern = result[0];
    expect(topPattern.averageAmount).toBeGreaterThanOrEqual(50);
  });

  it("deve retornar padrões ordenados por valor médio", async () => {
    const transactions = [
      createExpense(100, "Alimentação", 1),
      createExpense(500, "Alimentação", 5),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.detectSpendingPatterns("user-1");

    if (result.length >= 2) {
      expect(result[0].averageAmount).toBeGreaterThanOrEqual(result[1].averageAmount);
    }
  });
});
