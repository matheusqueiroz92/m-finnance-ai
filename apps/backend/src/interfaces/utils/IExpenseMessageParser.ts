/**
 * Resultado do parse de uma mensagem de despesa
 */
export interface IParsedExpense {
  amount: number;
  description: string;
  date: Date;
  rawMessage: string;
}

/**
 * Interface para o parser de mensagens de despesa (WhatsApp, Telegram, etc.)
 */
export interface IExpenseMessageParser {
  /**
   * Extrai valor, descrição e data de uma mensagem de texto
   * @param message - Mensagem recebida (ex: "almoço 45,90", "uber 22 - ontem")
   * @returns Objeto com amount, description, date ou null se não conseguir parsear
   */
  parse(message: string): IParsedExpense | null;

  /**
   * Verifica se a mensagem parece ser uma despesa
   * @param message - Mensagem a validar
   * @returns true se a mensagem contém indicadores de despesa
   */
  isValidExpenseMessage(message: string): boolean;
}
