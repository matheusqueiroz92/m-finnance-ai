import { ExpenseMessageParser } from "../../utils/ExpenseMessageParser";

describe("ExpenseMessageParser", () => {
  let parser: ExpenseMessageParser;

  beforeEach(() => {
    parser = new ExpenseMessageParser();
  });

  describe("parse", () => {
    describe("formatos com descrição antes do valor", () => {
      it("deve extrair valor e descrição de 'almoço 45,90'", () => {
        const result = parser.parse("almoço 45,90");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(45.9);
        expect(result!.description).toBe("almoço");
        expect(result!.date).toBeInstanceOf(Date);
      });

      it("deve extrair valor e descrição de 'uber 22'", () => {
        const result = parser.parse("uber 22");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(22);
        expect(result!.description).toBe("uber");
      });

      it("deve extrair valor e descrição de 'farmácia 89,50'", () => {
        const result = parser.parse("farmácia 89,50");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(89.5);
        expect(result!.description).toBe("farmácia");
      });

      it("deve extrair valor com R$ explícito", () => {
        const result = parser.parse("almoço R$ 45,90");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(45.9);
        expect(result!.description).toBe("almoço");
      });
    });

    describe("formatos com valor antes da descrição", () => {
      it("deve extrair de '45,90 almoço'", () => {
        const result = parser.parse("45,90 almoço");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(45.9);
        expect(result!.description).toBe("almoço");
      });

      it("deve extrair de '150 mercado'", () => {
        const result = parser.parse("150 mercado");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(150);
        expect(result!.description).toBe("mercado");
      });
    });

    describe("formatos com 'gastei' e variações", () => {
      it("deve extrair de 'gastei 150 no mercado hoje'", () => {
        const result = parser.parse("gastei 150 no mercado hoje");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(150);
        expect(result!.description).toContain("mercado");
      });

      it("deve extrair de 'gastei R$ 50 em almoço'", () => {
        const result = parser.parse("gastei R$ 50 em almoço");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(50);
        expect(result!.description).toContain("almoço");
      });
    });

    describe("formatos com prefixo despesa", () => {
      it("deve extrair de 'despesa: farmácia 89,50'", () => {
        const result = parser.parse("despesa: farmácia 89,50");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(89.5);
        expect(result!.description).toBe("farmácia");
      });
    });

    describe("tratamento de datas", () => {
      it("deve usar hoje como data padrão", () => {
        const result = parser.parse("almoço 30");
        const today = new Date();

        expect(result).not.toBeNull();
        expect(result!.date.getDate()).toBe(today.getDate());
        expect(result!.date.getMonth()).toBe(today.getMonth());
        expect(result!.date.getFullYear()).toBe(today.getFullYear());
      });

      it("deve parsear 'ontem'", () => {
        const result = parser.parse("uber 22 ontem");

        expect(result).not.toBeNull();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(result!.date.getDate()).toBe(yesterday.getDate());
      });

      it("deve parsear 'ontem' em formato 'uber 22 - ontem'", () => {
        const result = parser.parse("uber 22 - ontem");

        expect(result).not.toBeNull();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(result!.date.getDate()).toBe(yesterday.getDate());
      });
    });

    describe("formatos com ponto decimal", () => {
      it("deve aceitar ponto como separador decimal", () => {
        const result = parser.parse("almoço 45.90");

        expect(result).not.toBeNull();
        expect(result!.amount).toBe(45.9);
      });
    });

    describe("casos inválidos", () => {
      it("deve retornar null para mensagem vazia", () => {
        const result = parser.parse("");
        expect(result).toBeNull();
      });

      it("deve retornar null para mensagem sem número", () => {
        const result = parser.parse("oi, como vai?");
        expect(result).toBeNull();
      });

      it("deve retornar null para apenas espaços", () => {
        const result = parser.parse("   ");
        expect(result).toBeNull();
      });
    });

    describe("rawMessage", () => {
      it("deve incluir a mensagem original no resultado", () => {
        const message = "almoço 45,90";
        const result = parser.parse(message);

        expect(result).not.toBeNull();
        expect(result!.rawMessage).toBe(message);
      });
    });
  });

  describe("isValidExpenseMessage", () => {
    it("deve retornar true para mensagens que contêm valor", () => {
      expect(parser.isValidExpenseMessage("almoço 45,90")).toBe(true);
      expect(parser.isValidExpenseMessage("uber 22")).toBe(true);
      expect(parser.isValidExpenseMessage("gastei 150 no mercado")).toBe(true);
    });

    it("deve retornar false para mensagens sem valor", () => {
      expect(parser.isValidExpenseMessage("oi")).toBe(false);
      expect(parser.isValidExpenseMessage("qual meu saldo?")).toBe(false);
    });

    it("deve retornar false para mensagem vazia", () => {
      expect(parser.isValidExpenseMessage("")).toBe(false);
    });
  });
});
