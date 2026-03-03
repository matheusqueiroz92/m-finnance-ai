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
   * Envia uma mensagem ao consultor financeiro com contexto do usuário.
   * @param userId - ID do usuário
   * @param message - Mensagem do usuário
   * @param history - Histórico opcional da conversa (para multi-turn)
   * @returns Resposta do consultor
   */
  chat(
    userId: string,
    message: string,
    history?: IConsultantMessage[]
  ): Promise<IConsultantReply>;
}
