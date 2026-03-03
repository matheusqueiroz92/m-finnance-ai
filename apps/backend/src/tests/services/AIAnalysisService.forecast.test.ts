import { AIAnalysisService } from "../../services/AIAnalysisService";
import { IExpenseForecast } from "../../interfaces/services/IAIAnalysisService";

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

describe("AIAnalysisService - forecastNextMonthExpenses", () => {
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

  const createExpense = (amount: number, categoryName: string, yearMonth: string) => {
    const [y, m] = yearMonth.split("-").map(Number);
    const date = new Date(y, m - 1, 15);
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

  it("deve retornar previsão vazia quando não há transações", async () => {
    mockFindByDateRange.mockResolvedValue([]);

    const result = await aiAnalysisService.forecastNextMonthExpenses("user-1");

    expect(result.predictedTotal).toBe(0);
    expect(result.byCategory).toEqual({});
    expect(result.basedOnMonths).toBe(0);
  });

  it("deve prever baseado na média dos meses anteriores", async () => {
    const transactions = [
      createExpense(100, "Alimentação", "2025-01"),
      createExpense(200, "Alimentação", "2025-02"),
      createExpense(150, "Transporte", "2025-01"),
      createExpense(150, "Transporte", "2025-02"),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.forecastNextMonthExpenses("user-1");

    expect(result.predictedTotal).toBe(300);
    expect(result.byCategory).toMatchObject({
      Alimentação: 150,
      Transporte: 150,
    });
    expect(result.nextMonth).toBe("2025-04");
    expect(result.basedOnMonths).toBeGreaterThanOrEqual(2);
  });

  it("deve incluir confidence e nextMonth", async () => {
    const transactions = [
      createExpense(100, "Alimentação", "2025-01"),
      createExpense(200, "Alimentação", "2025-02"),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.forecastNextMonthExpenses("user-1");

    expect(result).toHaveProperty("confidence");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.nextMonth).toMatch(/^\d{4}-\d{2}$/);
  });
});
