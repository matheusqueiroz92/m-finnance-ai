/**
 * Resultado do parse de uma mensagem de despesa
 */
export interface IParsedExpense {
  amount: number;
  description: string;
  date: Date;
  rawMessage: string;
  /** Sugestão de categoria (ex.: "Alimentação") quando inferida por IA */
  suggestedCategoryName?: string;
}

/**
 * Interface para o parser de mensagens de despesa (WhatsApp, Telegram, etc.)
 */
export interface IExpenseMessageParser {
  /**
   * Extrai valor, descrição e data de uma mensagem de texto (pode usar IA em fallback).
   * @param message - Mensagem recebida (ex: "almoço 45,90", "uber 22 - ontem")
   * @returns Objeto com amount, description, date ou null se não conseguir parsear
   */
  parse(message: string): Promise<IParsedExpense | null>;

  /**
   * Verifica se a mensagem parece ser uma despesa
   * @param message - Mensagem a validar
   * @returns true se a mensagem contém indicadores de despesa
   */
  isValidExpenseMessage(message: string): boolean;
}
