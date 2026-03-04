import { WhatsAppTransactionService } from "../../services/WhatsAppTransactionService";

const mockFindByPhone = jest.fn();
const mockCreateTransaction = jest.fn();
const mockFindByUserAccount = jest.fn();
const mockFindByUserCategory = jest.fn();
const mockParserParse = jest.fn();

const mockUserRepository = { findByPhone: mockFindByPhone };
const mockTransactionService = { createTransaction: mockCreateTransaction };
const mockAccountRepository = { findByUser: mockFindByUserAccount };
const mockCategoryRepository = { findByUser: mockFindByUserCategory };
const mockParser = { parse: mockParserParse, isValidExpenseMessage: jest.fn() };

describe("WhatsAppTransactionService", () => {
  let service: WhatsAppTransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByUserAccount.mockResolvedValue([{ _id: "acc-1" }]);
    mockFindByUserCategory.mockResolvedValue([
      { _id: "cat-1", name: "Outras despesas" },
    ]);
    mockParserParse.mockResolvedValue({
      amount: 45.9,
      description: "almoço",
      date: new Date(),
      rawMessage: "almoço 45,90",
    });
    service = new WhatsAppTransactionService(
      mockUserRepository as any,
      mockTransactionService as any,
      mockAccountRepository as any,
      mockCategoryRepository as any,
      mockParser as any
    );
  });

  describe("processIncomingMessage", () => {
    it("retorna mensagem quando número não está vinculado", async () => {
      mockFindByPhone.mockResolvedValue(null);

      const result = await service.processIncomingMessage(
        "whatsapp:+5511999999999",
        "almoço 45,90"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("não vinculado");
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    });

    it("retorna mensagem quando corpo está vazio", async () => {
      const result = await service.processIncomingMessage(
        "whatsapp:+5511999999999",
        "   "
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("descrição");
      expect(mockFindByPhone).not.toHaveBeenCalled();
    });

    it("retorna mensagem quando parser não entende (parse retorna null)", async () => {
      mockFindByPhone.mockResolvedValue({ _id: "user-1" });
      mockParserParse.mockResolvedValue(null);

      const result = await service.processIncomingMessage(
        "whatsapp:+5511999999999",
        "texto sem valor numérico"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("Não consegui entender");
      expect(mockCreateTransaction).not.toHaveBeenCalled();
    });

    it("processa mensagem válida e cria transação", async () => {
      mockFindByPhone.mockResolvedValue({ _id: "user-1" });
      mockCreateTransaction.mockResolvedValue({});
      mockParserParse.mockResolvedValue({
        amount: 45.9,
        description: "almoço",
        date: new Date(),
        rawMessage: "almoço 45,90",
      });

      const result = await service.processIncomingMessage(
        "whatsapp:+5511999999999",
        "almoço 45,90"
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain("Despesa registrada");
      expect(result.message).toContain("45.90");
      expect(mockCreateTransaction).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          amount: 45.9,
          type: "expense",
          description: expect.any(String),
        })
      );
    });
  });
});
