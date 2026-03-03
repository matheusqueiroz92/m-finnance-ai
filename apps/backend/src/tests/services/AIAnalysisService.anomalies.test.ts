import { AIAnalysisService } from "../../services/AIAnalysisService";
import { IAnomaly } from "../../interfaces/services/IAIAnalysisService";

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

describe("AIAnalysisService - detectAnomalies", () => {
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

  const createExpenseTransaction = (
    amount: number,
    categoryName: string,
    date: Date
  ) => ({
    _id: "tx-id",
    type: "expense" as const,
    amount,
    date,
    category: { _id: "cat-id", name: categoryName },
    user: "user-id",
    account: {},
    description: "test",
    isRecurring: false,
  });

  it("deve retornar array vazio quando não há transações", async () => {
    mockFindByDateRange.mockResolvedValue([]);

    const result = await aiAnalysisService.detectAnomalies("user-1");

    expect(result).toEqual([]);
    expect(mockFindByDateRange).toHaveBeenCalledWith("user-1", expect.any(Date), expect.any(Date));
  });

  it("deve retornar array vazio quando há pouco histórico (menos de 2 meses)", async () => {
    const now = new Date("2025-03-15");
    const transactions = [
      createExpenseTransaction(100, "Alimentação", new Date("2025-03-01")),
      createExpenseTransaction(200, "Transporte", new Date("2025-03-05")),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.detectAnomalies("user-1");

    expect(result).toEqual([]);
  });

  it("deve detectar anomalia quando gasto atual é 50% maior que a média", async () => {
    const baseDate = new Date("2025-01-01");
    const transactions = [
      // Mês 1: Alimentação 200, Transporte 100
      createExpenseTransaction(200, "Alimentação", new Date("2025-01-15")),
      createExpenseTransaction(100, "Transporte", new Date("2025-01-10")),
      // Mês 2: Alimentação 200, Transporte 100
      createExpenseTransaction(200, "Alimentação", new Date("2025-02-15")),
      createExpenseTransaction(100, "Transporte", new Date("2025-02-10")),
      // Mês 3 (atual): Alimentação 500 (anomalia - média 200), Transporte 100
      createExpenseTransaction(500, "Alimentação", new Date("2025-03-15")),
      createExpenseTransaction(100, "Transporte", new Date("2025-03-10")),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.detectAnomalies("user-1");

    expect(result.length).toBeGreaterThanOrEqual(1);
    const alimentacaoAnomaly = result.find((a: IAnomaly) => a.category === "Alimentação");
    expect(alimentacaoAnomaly).toBeDefined();
    expect(alimentacaoAnomaly!.currentAmount).toBe(500);
    expect(alimentacaoAnomaly!.averageAmount).toBe(200);
    expect(alimentacaoAnomaly!.percentageIncrease).toBeGreaterThanOrEqual(100);
    expect(alimentacaoAnomaly!.message).toBeDefined();
  });

  it("não deve detectar anomalia quando gastos estão dentro do padrão", async () => {
    const transactions = [
      createExpenseTransaction(200, "Alimentação", new Date("2025-01-15")),
      createExpenseTransaction(200, "Alimentação", new Date("2025-02-15")),
      createExpenseTransaction(210, "Alimentação", new Date("2025-03-15")),
    ];
    mockFindByDateRange.mockResolvedValue(transactions);

    const result = await aiAnalysisService.detectAnomalies("user-1");

    expect(result).toEqual([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
