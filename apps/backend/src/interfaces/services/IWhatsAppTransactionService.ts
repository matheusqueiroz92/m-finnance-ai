/**
 * Resultado do processamento de uma mensagem WhatsApp para registro de despesa.
 */
export interface IWhatsAppProcessResult {
  success: boolean;
  message: string;
}

export interface IWhatsAppTransactionService {
  /**
   * Processa mensagem recebida do WhatsApp: identifica usuário pelo telefone,
   * parseia a mensagem (valor, descrição, data) e cria a transação de despesa.
   * @param from - Número do remetente (ex.: whatsapp:+5511999999999)
   * @param body - Corpo da mensagem (ex.: "almoço 45,90")
   * @returns Mensagem para enviar como resposta no WhatsApp
   */
  processIncomingMessage(from: string, body: string): Promise<IWhatsAppProcessResult>;
}
