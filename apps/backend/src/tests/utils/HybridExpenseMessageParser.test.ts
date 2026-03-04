import { HybridExpenseMessageParser } from "../../utils/HybridExpenseMessageParser";

describe("HybridExpenseMessageParser", () => {
  const originalEnv = process.env.OPENAI_API_KEY;
  let parser: HybridExpenseMessageParser;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    parser = new HybridExpenseMessageParser();
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });

  describe("parse (regex path)", () => {
    it("retorna resultado do regex quando mensagem é parseável", async () => {
      const result = await parser.parse("almoço 45,90");
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(45.9);
      expect(result!.description).toBe("almoço");
      expect(result!.date).toBeInstanceOf(Date);
    });

    it("retorna null quando regex falha e não há API key (sem fallback IA)", async () => {
      const result = await parser.parse("gastei dez reais no lanche");
      expect(result).toBeNull();
    });
  });

  describe("isValidExpenseMessage", () => {
    it("retorna true para mensagens com valor numérico", () => {
      expect(parser.isValidExpenseMessage("almoço 45,90")).toBe(true);
    });

    it("retorna true para texto com número mesmo sem formato típico", () => {
      expect(parser.isValidExpenseMessage("algo 10")).toBe(true);
    });

    it("retorna false para mensagem vazia ou muito curta", () => {
      expect(parser.isValidExpenseMessage("")).toBe(false);
      expect(parser.isValidExpenseMessage("oi")).toBe(false);
    });
  });
});
