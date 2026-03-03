import { injectable, inject } from "tsyringe";
import {
  IInvestmentRecommendationService,
  InvestmentProfile,
  IInvestmentRecommendation,
  IAllocationSuggestion,
} from "../interfaces/services/IInvestmentRecommendationService";
import { ITransactionRepository } from "../interfaces/repositories/ITransactionRepository";
import { IInvestmentRepository } from "../interfaces/repositories/IInvestmentRepository";
import { IGoalRepository } from "../interfaces/repositories/IGoalRepository";

const PROFILES: Record<
  InvestmentProfile,
  { allocation: IAllocationSuggestion[]; message: string }
> = {
  conservador: {
    allocation: [
      { assetClass: "Renda Fixa (CDB, Tesouro, LCI/LCA)", percentage: 70, description: "Baixo risco", examples: ["CDB", "Tesouro Selic", "LCI"] },
      { assetClass: "Fundos Imobiliários", percentage: 20, description: "Renda passiva", examples: ["FIIs"] },
      { assetClass: "Renda Variável", percentage: 10, description: "Potencial de crescimento", examples: ["Ações", "ETFs"] },
    ],
    message: "Perfil conservador: priorize preservação do capital com exposição limitada à volatilidade.",
  },
  moderado: {
    allocation: [
      { assetClass: "Renda Fixa", percentage: 50, description: "Base sólida", examples: ["CDB", "Tesouro IPCA"] },
      { assetClass: "Fundos Imobiliários", percentage: 20, description: "Dividendos", examples: ["FIIs"] },
      { assetClass: "Renda Variável", percentage: 30, description: "Crescimento", examples: ["Ações", "ETFs"] },
    ],
    message: "Perfil moderado: equilíbrio entre segurança e potencial de retorno.",
  },
  arrojado: {
    allocation: [
      { assetClass: "Renda Fixa", percentage: 20, description: "Reserva", examples: ["Tesouro Selic"] },
      { assetClass: "Fundos Imobiliários", percentage: 20, description: "Dividendos", examples: ["FIIs"] },
      { assetClass: "Renda Variável", percentage: 60, description: "Alto crescimento", examples: ["Ações", "ETFs", "BDRs"] },
    ],
    message: "Perfil arrojado: maior exposição à renda variável para maximizar retornos no longo prazo.",
  },
};

@injectable()
export class InvestmentRecommendationService implements IInvestmentRecommendationService {
  constructor(
    @inject("TransactionRepository")
    private transactionRepository: ITransactionRepository,
    @inject("InvestmentRepository")
    private investmentRepository: IInvestmentRepository,
    @inject("GoalRepository")
    private goalRepository: IGoalRepository
  ) {}

  async getRecommendations(
    userId: string,
    profile: InvestmentProfile = "conservador"
  ): Promise<IInvestmentRecommendation> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [transactions, investments, goals] = await Promise.all([
      this.transactionRepository.findByDateRange(userId, threeMonthsAgo, new Date()),
      this.investmentRepository.findByUser(userId, { isActive: true }),
      this.goalRepository.findByUser(userId, false),
    ]);

    const totalIncome = transactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    const monthlySavings = totalIncome > 0 ? (totalIncome - totalExpenses) / 3 : 0;

    const totalInvested = investments.reduce((sum: number, inv: any) => sum + (inv.currentValue || 0), 0);
    const hasEmergencyFund = goals.some((g: any) =>
      (g.name || "").toLowerCase().includes("emergência") || (g.name || "").toLowerCase().includes("reserva")
    );

    const opportunityIndicators: string[] = [];

    if (savingsRate >= 0.2 && totalInvested === 0) {
      opportunityIndicators.push("Você tem boa taxa de poupança. Considere começar a investir.");
    }
    if (savingsRate >= 0.3) {
      opportunityIndicators.push("Taxa de poupança saudável - oportunidade para diversificar.");
    }
    if (hasEmergencyFund) {
      opportunityIndicators.push("Reserva de emergência em construção - priorize liquidez antes de arriscar mais.");
    } else if (totalInvested > 0) {
      opportunityIndicators.push("Considere reforçar reserva de emergência (6 meses de despesas) antes de ampliar riscos.");
    }

    const config = PROFILES[profile];

    return {
      profile,
      allocation: config.allocation,
      message: config.message,
      opportunityIndicators: opportunityIndicators.length > 0 ? opportunityIndicators : ["Mantenha a disciplina de poupar e investir."],
      suggestedMonthlyAmount: Math.round(monthlySavings * 100) / 100,
    };
  }
}
