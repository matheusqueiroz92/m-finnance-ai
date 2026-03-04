import {
  IExpenseMessageParser,
  IParsedExpense,
} from "../interfaces/utils/IExpenseMessageParser";

/**
 * Parser de mensagens de despesa para WhatsApp/Telegram.
 * Suporta formatos como:
 * - "almoço 45,90"
 * - "uber 22 - ontem"
 * - "gastei 150 no mercado hoje"
 * - "despesa: farmácia 89,50"
 */
export class ExpenseMessageParser implements IExpenseMessageParser {
  /**
   * Regex para detectar valores monetários (45,90 / 45.90 / R$ 45,90)
   */
  private readonly amountRegex =
    /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*(?:[.,]\d{2})?|\d+(?:[.,]\d{1,2})?)/;

  /**
   * Palavras que indicam referência temporal
   */
  private readonly dateKeywords: Record<string, (d: Date) => Date> = {
    hoje: (d) => d,
    ontem: (d) => {
      const result = new Date(d);
      result.setDate(result.getDate() - 1);
      return result;
    },
  };

  async parse(message: string): Promise<IParsedExpense | null> {
    const trimmed = message.trim();
    if (!trimmed) return null;

    const amountMatch = trimmed.match(this.amountRegex);
    if (!amountMatch || amountMatch[1] === undefined) return null;

    const amount = this.parseAmount(amountMatch[1]);
    if (amount <= 0) return null;

    const description = this.extractDescription(trimmed, amountMatch);
    const date = this.extractDate(trimmed);

    return Promise.resolve({
      amount,
      description: description.trim() || "Despesa",
      date,
      rawMessage: trimmed,
    });
  }

  isValidExpenseMessage(message: string): boolean {
    const trimmed = message.trim();
    if (!trimmed) return false;

    return this.amountRegex.test(trimmed);
  }

  /**
   * Converte string de valor para número.
   * Suporta: 45,90 (BR) | 45.90 (US) | 1.234,56 (BR com milhar)
   */
  private parseAmount(valueStr: string): number {
    const hasComma = valueStr.includes(",");
    const hasDot = valueStr.includes(".");

    if (hasComma && hasDot) {
      // Formato BR: 1.234,56
      return parseFloat(valueStr.replace(/\./g, "").replace(",", ".")) || 0;
    }
    if (hasComma) {
      // Formato BR: 45,90
      return parseFloat(valueStr.replace(",", ".")) || 0;
    }
    if (hasDot) {
      // Formato US (45.90) vs milhar BR (1.000)
      const parts = valueStr.split(".");
      const decimals = parts[parts.length - 1];
      if (decimals && decimals.length <= 2) {
        return parseFloat(valueStr) || 0;
      }
      return parseFloat(valueStr.replace(/\./g, "")) || 0;
    }
    return parseFloat(valueStr) || 0;
  }

  /**
   * Extrai a descrição removendo valor, R$, e palavras de data
   */
  private extractDescription(fullMessage: string, amountMatch: RegExpMatchArray): string {
    const amountPart = amountMatch[0];
    let description = fullMessage
      .replace(amountPart, " ")
      .replace(/\b(hoje|ontem)\b/gi, "")
      .replace(/\b(despesa|gastei|gastou)\s*:?\s*/gi, "")
      .replace(/\b(no|em|de)\s+/gi, " ")
      .replace(/\s*-\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return description;
  }

  /**
   * Extrai a data da mensagem ou usa hoje
   */
  private extractDate(message: string): Date {
    const lower = message.toLowerCase();

    for (const [keyword, fn] of Object.entries(this.dateKeywords)) {
      if (lower.includes(keyword)) {
        return fn(new Date());
      }
    }

    return new Date();
  }
}
