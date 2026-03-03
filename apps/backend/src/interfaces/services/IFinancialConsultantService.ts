/**
 * Mensagem da conversa (usuário ou assistente)
 */
export interface IConsultantMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Resposta do consultor
 */
export interface IConsultantReply {
  reply: string;
}

export interface IFinancialConsultantService {
  /**
   * Envia uma mensagem ao consultor financeiro.
   * @param userId - ID do usuário
   * @param message - Mensagem do usuário
   * @param history - Histórico opcional da conversa (para multi-turn)
   * @param useUserContext - Se true, inclui dados financeiros do usuário no contexto; se false, respostas genéricas (educação financeira)
   * @returns Resposta do consultor
   */
  chat(
    userId: string,
    message: string,
    history?: IConsultantMessage[],
    useUserContext?: boolean
  ): Promise<IConsultantReply>;
}
