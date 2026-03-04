/**
 * F3-06: Testes com cenários de mensagens reais.
 * Usa o parser real (HybridExpenseMessageParser com regex) para validar o fluxo completo.
 */
import { WhatsAppTransactionService } from "../../services/WhatsAppTransactionService";
import { HybridExpenseMessageParser } from "../../utils/HybridExpenseMessageParser";

const mockFindByPhone = jest.fn();
const mockCreateTransaction = jest.fn();
const mockFindByUserAccount = jest.fn();
const mockFindByUserCategory = jest.fn();

const mockUserRepository = { findByPhone: mockFindByPhone };
const mockTransactionService = { createTransaction: mockCreateTransaction };
const mockAccountRepository = { findByUser: mockFindByUserAccount };
const mockCategoryRepository = { findByUser: mockFindByUserCategory };

describe("WhatsAppTransactionService - cenários de mensagens reais", () => {
  const originalEnv = process.env.OPENAI_API_KEY;
  let service: WhatsAppTransactionService;

  beforeAll(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByPhone.mockResolvedValue({ _id: "user-1" });
    mockFindByUserAccount.mockResolvedValue([{ _id: "acc-1" }]);
    mockFindByUserCategory.mockResolvedValue([
      { _id: "cat-1", name: "Outras despesas" },
    ]);
    mockCreateTransaction.mockResolvedValue({});
    const realParser = new HybridExpenseMessageParser();
    service = new WhatsAppTransactionService(
      mockUserRepository as any,
      mockTransactionService as any,
      mockAccountRepository as any,
      mockCategoryRepository as any,
      realParser
    );
  });

  it("processa 'almoço 45,90' e cria transação com valor e descrição corretos", async () => {
    const result = await service.processIncomingMessage(
      "whatsapp:+5511999999999",
      "almoço 45,90"
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain("Despesa registrada");
    expect(result.message).toContain("45.90");
    expect(result.message).toContain("almoço");
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        amount: 45.9,
        type: "expense",
        description: "almoço",
      })
    );
  });

  it("processa 'uber 22 - ontem' e usa data ontem", async () => {
    const result = await service.processIncomingMessage(
      "whatsapp:+5511999999999",
      "uber 22 - ontem"
    );

    expect(result.success).toBe(true);
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        amount: 22,
        description: "uber",
      })
    );
    const call = mockCreateTransaction.mock.calls[0][1];
    const date = new Date(call.date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(date.getDate()).toBe(yesterday.getDate());
  });

  it("processa 'gastei 150 no mercado hoje'", async () => {
    const result = await service.processIncomingMessage(
      "whatsapp:+5511999999999",
      "gastei 150 no mercado hoje"
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain("150");
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        amount: 150,
        type: "expense",
      })
    );
    const call = mockCreateTransaction.mock.calls[0][1];
    expect(call.description).toContain("mercado");
  });

  it("processa 'despesa: farmácia 89,50'", async () => {
    const result = await service.processIncomingMessage(
      "whatsapp:+5511999999999",
      "despesa: farmácia 89,50"
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain("89.50");
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        amount: 89.5,
        description: "farmácia",
      })
    );
  });

  it("processa 'posto 120,00'", async () => {
    const result = await service.processIncomingMessage(
      "whatsapp:+5511888888888",
      "posto 120,00"
    );

    expect(result.success).toBe(true);
    expect(mockCreateTransaction).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ amount: 120, description: "posto" })
    );
  });

  it("retorna erro para mensagem sem valor numérico", async () => {
    const result = await service.processIncomingMessage(
      "whatsapp:+5511999999999",
      "oi, tudo bem?"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("Não consegui entender");
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro quando número não está vinculado", async () => {
    mockFindByPhone.mockResolvedValueOnce(null);

    const result = await service.processIncomingMessage(
      "whatsapp:+5511777777777",
      "almoço 30"
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("não vinculado");
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });
});
