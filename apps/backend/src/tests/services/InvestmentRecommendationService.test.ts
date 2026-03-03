import { InvestmentRecommendationService } from "../../services/InvestmentRecommendationService";

const mockFindByDateRange = jest.fn();
const mockFindByUser = jest.fn();
const mockFindByUserGoals = jest.fn();

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

const mockInvestmentRepository = {
  findByUser: mockFindByUser,
  create: jest.fn(),
  findById: jest.fn(),
  countByUser: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getInvestmentsByAccount: jest.fn(),
};

const mockGoalRepository = {
  findByUser: mockFindByUserGoals,
  countByUser: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  calculateProgress: jest.fn(),
};

describe("InvestmentRecommendationService", () => {
  let service: InvestmentRecommendationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InvestmentRecommendationService(
      mockTransactionRepository as any,
      mockInvestmentRepository as any,
      mockGoalRepository as any
    );
  });

  it("deve retornar alocação conservadora por padrão", async () => {
    mockFindByDateRange.mockResolvedValue([
      { type: "income", amount: 5000 },
      { type: "expense", amount: 4000 },
    ]);
    mockFindByUser.mockResolvedValue([]);
    mockFindByUserGoals.mockResolvedValue([]);

    const result = await service.getRecommendations("user-1");

    expect(result.profile).toBe("conservador");
    expect(result.allocation.length).toBeGreaterThan(0);
    expect(result.message).toBeDefined();
  });

  it("deve respeitar o perfil informado", async () => {
    mockFindByDateRange.mockResolvedValue([]);
    mockFindByUser.mockResolvedValue([]);
    mockFindByUserGoals.mockResolvedValue([]);

    const result = await service.getRecommendations("user-1", "arrojado");

    expect(result.profile).toBe("arrojado");
  });

  it("deve incluir indicadores de oportunidade", async () => {
    mockFindByDateRange.mockResolvedValue([
      { type: "income", amount: 10000 },
      { type: "expense", amount: 5000 },
    ]);
    mockFindByUser.mockResolvedValue([]);
    mockFindByUserGoals.mockResolvedValue([]);

    const result = await service.getRecommendations("user-1");

    expect(result.opportunityIndicators).toBeDefined();
    expect(Array.isArray(result.opportunityIndicators)).toBe(true);
  });
});
