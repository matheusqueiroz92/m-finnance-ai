import { FinancialPlanningService } from "../../services/FinancialPlanningService";

const mockFindByDateRange = jest.fn();
const mockFindByUser = jest.fn();

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
  findByUser: mockFindByUser,
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  calculateProgress: jest.fn(),
};

describe("FinancialPlanningService", () => {
  let service: FinancialPlanningService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FinancialPlanningService(
      mockTransactionRepository as any,
      mockGoalRepository as any
    );
  });

  describe("getPlan", () => {
    it("deve retornar plano 50/30/20 quando não há histórico", async () => {
      mockFindByDateRange.mockResolvedValue([]);
      mockFindByUser.mockResolvedValue([]);

      const plan = await service.getPlan("user-1");

      expect(plan.allocation.needs).toBe(50);
      expect(plan.allocation.wants).toBe(30);
      expect(plan.allocation.savings).toBe(20);
      expect(plan.monthlyIncome).toBe(0);
      expect(plan.suggestedGoals).toBeDefined();
      expect(Array.isArray(plan.milestones)).toBe(true);
    });

    it("deve calcular renda mensal e sugestão de poupança com base em transações", async () => {
      mockFindByDateRange.mockResolvedValue([
        { type: "income", amount: 6000 },
        { type: "income", amount: 6000 },
        { type: "expense", amount: 4000 },
        { type: "expense", amount: 3500 },
      ]);
      mockFindByUser.mockResolvedValue([]);

      const plan = await service.getPlan("user-1");

      expect(plan.monthlyIncome).toBeGreaterThan(0);
      expect(plan.suggestedMonthlySavings).toBeGreaterThanOrEqual(0);
      expect(plan.allocation.needs + plan.allocation.wants + plan.allocation.savings).toBe(100);
    });
  });

  describe("simulateScenario", () => {
    it("deve retornar projeção de economia ao longo dos meses", async () => {
      mockFindByDateRange.mockResolvedValue([
        { type: "income", amount: 5000 },
        { type: "expense", amount: 4000 },
      ]);

      const result = await service.simulateScenario("user-1", 20, 12);

      expect(result.savingsPercent).toBe(20);
      expect(result.months).toBe(12);
      expect(result.byMonth.length).toBe(12);
      expect(result.totalSaved).toBeGreaterThanOrEqual(0);
    });

    it("deve calcular total poupado corretamente para 10% em 6 meses", async () => {
      mockFindByDateRange.mockResolvedValue([
        { type: "income", amount: 10000 },
        { type: "expense", amount: 9000 },
      ]);

      const result = await service.simulateScenario("user-1", 10, 6);

      const monthlySavings = result.monthlyIncome * (result.savingsPercent / 100);
      expect(result.totalSaved).toBeCloseTo(monthlySavings * 6, 0);
    });
  });

  describe("getAdherence", () => {
    it("deve retornar aderência com alvo 50/30/20", async () => {
      mockFindByDateRange.mockResolvedValue([
        { type: "income", amount: 5000 },
        { type: "expense", amount: 2500, category: { name: "Moradia" } },
        { type: "expense", amount: 1500, category: { name: "Lazer" } },
        { type: "expense", amount: 1000, category: { name: "Investimentos" } },
      ]);
      mockFindByUser.mockResolvedValue([]);

      const result = await service.getAdherence("user-1");

      expect(result.targetAllocation.needs).toBe(50);
      expect(result.targetAllocation.wants).toBe(30);
      expect(result.targetAllocation.savings).toBe(20);
      expect(result.adherenceScore).toBeGreaterThanOrEqual(0);
      expect(result.adherenceScore).toBeLessThanOrEqual(100);
      expect(result.suggestions).toBeDefined();
    });
  });
});
