export type InvestmentProfile = "conservador" | "moderado" | "arrojado";

export interface IAllocationSuggestion {
  assetClass: string;
  percentage: number;
  description: string;
  examples?: string[];
}

export interface IInvestmentRecommendation {
  profile: InvestmentProfile;
  allocation: IAllocationSuggestion[];
  message: string;
  opportunityIndicators: string[];
  suggestedMonthlyAmount?: number;
}

export interface IInvestmentRecommendationService {
  /**
   * Gera recomendações de investimento baseadas em perfil e dados do usuário
   * @param userId - ID do usuário
   * @param profile - Perfil de risco (conservador, moderado, arrojado)
   * @returns Recomendações de alocação e oportunidades
   */
  getRecommendations(
    userId: string,
    profile?: InvestmentProfile
  ): Promise<IInvestmentRecommendation>;
}
