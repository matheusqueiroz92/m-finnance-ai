import { FinancialConsultantService } from "../../services/FinancialConsultantService";

jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "Com base no seu contexto, recomendo priorizar a reserva de emergência.",
              },
            },
          ],
        }),
      },
    },
  })),
}));

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

describe("FinancialConsultantService", () => {
  let service: FinancialConsultantService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByDateRange.mockResolvedValue([
      { type: "income", amount: 5000 },
      { type: "expense", amount: 3000, category: { name: "Alimentação" } },
    ]);
    mockFindByUser.mockResolvedValue([
      { name: "Reserva de emergência", targetAmount: 15000, currentAmount: 5000 },
    ]);

    service = new FinancialConsultantService(
      mockTransactionRepository as any,
      mockGoalRepository as any
    );
  });

  describe("chat", () => {
    it("deve retornar resposta do consultor", async () => {
      const result = await service.chat("user-1", "Como melhorar meu score?");

      expect(result.reply).toBeDefined();
      expect(typeof result.reply).toBe("string");
      expect(result.reply.length).toBeGreaterThan(0);
    });

    it("deve incluir histórico quando fornecido", async () => {
      const history = [
        { role: "user" as const, content: "Qual minha situação?" },
        { role: "assistant" as const, content: "Sua situação é..." },
      ];

      const result = await service.chat("user-1", "E o que fazer agora?", history);

      expect(result.reply).toBeDefined();
    });

    it("deve chamar repositórios para construir contexto quando useUserContext é true", async () => {
      await service.chat("user-1", "Olá", [], true);

      expect(mockFindByDateRange).toHaveBeenCalledWith("user-1", expect.any(Date), expect.any(Date));
      expect(mockFindByUser).toHaveBeenCalledWith("user-1", false);
    });

    it("não deve chamar repositórios quando useUserContext é false", async () => {
      const result = await service.chat("user-1", "O que é reserva de emergência?", [], false);

      expect(mockFindByDateRange).not.toHaveBeenCalled();
      expect(mockFindByUser).not.toHaveBeenCalled();
      expect(result.reply).toBeDefined();
    });
  });
});
