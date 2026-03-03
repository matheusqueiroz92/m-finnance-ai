import { injectable, inject } from "tsyringe";
import {
  IFinancialPlanningService,
  IFinancialPlan,
  IBudgetAllocation,
  ISimulationResult,
  IAdherenceResult,
  ISuggestedGoal,
  IPlanMilestone,
} from "../interfaces/services/IFinancialPlanningService";
import { ITransactionRepository } from "../interfaces/repositories/ITransactionRepository";
import { IGoalRepository } from "../interfaces/repositories/IGoalRepository";

const DEFAULT_ALLOCATION: IBudgetAllocation = {
  needs: 50,
  wants: 30,
  savings: 20,
};

const NEEDS_CATEGORIES = ["Moradia", "Alimentação", "Saúde", "Transporte", "Educação", "Contas"];
const WANTS_CATEGORIES = ["Lazer", "Assinaturas", "Compras", "Restaurantes"];
const SAVINGS_CATEGORIES = ["Investimentos", "Poupança", "Reserva"];

@injectable()
export class FinancialPlanningService implements IFinancialPlanningService {
  constructor(
    @inject("TransactionRepository")
    private transactionRepository: ITransactionRepository,
    @inject("GoalRepository")
    private goalRepository: IGoalRepository
  ) {}

  async getPlan(userId: string): Promise<IFinancialPlan> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [transactions, goals] = await Promise.all([
      this.transactionRepository.findByDateRange(userId, threeMonthsAgo, new Date()),
      this.goalRepository.findByUser(userId, false),
    ]);

    const { monthlyIncome } = this.computeIncomeAndAllocation(transactions);
    const allocation = { ...DEFAULT_ALLOCATION };
    const suggestedMonthlySavings = Math.round((monthlyIncome * allocation.savings) / 100 * 100) / 100;

    const suggestedGoals: ISuggestedGoal[] = [];
    if (suggestedMonthlySavings > 0 && goals.length === 0) {
      suggestedGoals.push(
        { name: "Reserva de emergência", targetAmount: monthlyIncome * 6, suggestedMonths: 12, priority: "high", description: "6 meses de despesas" },
        { name: "Investimentos", targetAmount: suggestedMonthlySavings * 24, suggestedMonths: 24, priority: "medium", description: "Poupança consistente" }
      );
    }

    const milestones: IPlanMilestone[] = [];
    let acc = 0;
    for (let m = 1; m <= 12; m++) {
      acc += suggestedMonthlySavings;
      milestones.push({
        month: m,
        description: m % 3 === 0 ? `Checkpoint ${m} meses` : `Mês ${m}`,
        targetAmount: Math.round(acc * 100) / 100,
        isCheckpoint: m % 3 === 0,
      });
    }

    const message = monthlyIncome > 0
      ? `Com base na sua renda média de R$ ${monthlyIncome.toFixed(2)}/mês, sugerimos alocação ${allocation.needs}/${allocation.wants}/${allocation.savings}.`
      : "Configure suas transações para um plano personalizado. Enquanto isso, use a regra 50/30/20.";

    return {
      allocation,
      monthlyIncome,
      suggestedMonthlySavings,
      suggestedGoals,
      milestones,
      message,
    };
  }

  async simulateScenario(
    userId: string,
    savingsPercent: number,
    months: number
  ): Promise<ISimulationResult> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const transactions = await this.transactionRepository.findByDateRange(
      userId,
      threeMonthsAgo,
      new Date()
    );

    const income = transactions.filter((t: any) => t.type === "income");
    const monthlyIncome =
      income.length > 0
        ? income.reduce((s: number, t: any) => s + t.amount, 0) / 3
        : 0;

    const monthlySavings = (monthlyIncome * Math.min(100, Math.max(0, savingsPercent))) / 100;
    const byMonth: { month: number; accumulated: number }[] = [];
    let accumulated = 0;
    for (let m = 1; m <= months; m++) {
      accumulated += monthlySavings;
      byMonth.push({ month: m, accumulated: Math.round(accumulated * 100) / 100 });
    }

    return {
      savingsPercent,
      months,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      totalSaved: Math.round(accumulated * 100) / 100,
      byMonth,
    };
  }

  async getAdherence(userId: string): Promise<IAdherenceResult> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const transactions = await this.transactionRepository.findByDateRange(
      userId,
      threeMonthsAgo,
      new Date()
    );

    const { allocation: currentAllocation } = this.computeIncomeAndAllocation(transactions);
    const targetAllocation = DEFAULT_ALLOCATION;

    const deviation =
      Math.abs(currentAllocation.needs - targetAllocation.needs) +
      Math.abs(currentAllocation.wants - targetAllocation.wants) +
      Math.abs(currentAllocation.savings - targetAllocation.savings);
    const adherenceScore = Math.max(0, Math.min(100, Math.round(100 - deviation)));

    const suggestions: string[] = [];
    if (currentAllocation.savings < targetAllocation.savings - 5) {
      suggestions.push("Aumente a parcela destinada à poupança/investimentos.");
    }
    if (currentAllocation.needs > targetAllocation.needs + 10) {
      suggestions.push("Revise gastos com necessidades para liberar margem.");
    }
    if (adherenceScore >= 80) {
      suggestions.push("Você está aderente ao plano. Mantenha a disciplina!");
    }

    const message =
      adherenceScore >= 80
        ? "Boa aderência ao plano financeiro."
        : adherenceScore >= 50
          ? "Há espaço para ajustar sua alocação em direção ao plano."
          : "Sua alocação atual difere bastante do plano sugerido.";

    return {
      currentAllocation,
      targetAllocation,
      adherenceScore,
      message,
      suggestions: suggestions.length > 0 ? suggestions : ["Mantenha o controle dos gastos por categoria."],
    };
  }

  private computeIncomeAndAllocation(transactions: any[]): {
    monthlyIncome: number;
    allocation: IBudgetAllocation;
  } {
    const income = transactions.filter((t: any) => t.type === "income");
    const expenses = transactions.filter((t: any) => t.type === "expense");

    const totalIncome = income.reduce((s: number, t: any) => s + t.amount, 0);
    const monthlyIncome = income.length > 0 ? totalIncome / 3 : 0;

    let needs = 0;
    let wants = 0;
    let savings = 0;
    const totalExpenses = expenses.reduce((s: number, t: any) => s + t.amount, 0);

    if (totalExpenses > 0 && monthlyIncome > 0) {
      for (const t of expenses) {
        const name = (t.category?.name || "").trim() || "Outros";
        if (NEEDS_CATEGORIES.some((c) => name.toLowerCase().includes(c.toLowerCase()))) {
          needs += t.amount;
        } else if (WANTS_CATEGORIES.some((c) => name.toLowerCase().includes(c.toLowerCase()))) {
          wants += t.amount;
        } else if (SAVINGS_CATEGORIES.some((c) => name.toLowerCase().includes(c.toLowerCase()))) {
          savings += t.amount;
        } else {
          wants += t.amount;
        }
      }
      const scale = totalExpenses > 0 ? 100 / totalExpenses : 0;
      needs = Math.round((needs * scale) * 10) / 10;
      wants = Math.round((wants * scale) * 10) / 10;
      savings = Math.round((savings * scale) * 10) / 10;
      const remainder = 100 - needs - wants - savings;
      if (remainder !== 0) wants = Math.round((wants + remainder) * 10) / 10;
    }

    if (needs === 0 && wants === 0 && savings === 0) {
      return { monthlyIncome, allocation: { ...DEFAULT_ALLOCATION } };
    }

    return {
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      allocation: { needs, wants, savings },
    };
  }
}
