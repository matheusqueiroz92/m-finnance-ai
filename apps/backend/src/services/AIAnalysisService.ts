import { injectable, inject } from "tsyringe";
import { IAIAnalysisService, IAnalysisMetrics, IAnomaly, ISpendingPattern, IExpenseForecast } from "../interfaces/services/IAIAnalysisService";
import { ITransactionRepository } from "../interfaces/repositories/ITransactionRepository";
import { IGoalRepository } from "../interfaces/repositories/IGoalRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import {
  IFinancialInsights,
  IReportInsight,
} from "../interfaces/entities/IReport";
import OpenAI from "openai";

@injectable()
export class AIAnalysisService implements IAIAnalysisService {
  private openai: OpenAI;

  constructor(
    @inject("TransactionRepository")
    private transactionRepository: ITransactionRepository,
    @inject("GoalRepository")
    private goalRepository: IGoalRepository,
    @inject("UserRepository")
    private userRepository: IUserRepository
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate financial insights based on user transactions
   * @param userId - The ID of the user to generate insights for
   * @returns A promise that resolves to the financial insights
   */
  async generateInsights(userId: string): Promise<IFinancialInsights> {
    try {
      // Get user's transactions for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const [transactions, goals] = await Promise.all([
        this.transactionRepository.findByDateRange(
          userId,
          threeMonthsAgo,
          new Date()
        ),
        this.goalRepository.findByUser(userId, false),
      ]);

      const metrics = this.calculateFinancialMetrics(transactions);
      const goalProbability = this.calculateGoalProbability(goals, metrics);
      const potentialSavings = this.calculatePotentialSavings(metrics);

      const aiResponse = await this.getAIInterpretation(metrics, goals, goalProbability)

      return {
        score: aiResponse.score,
        health: this.getHealthStatus(aiResponse.score.value),
        potentialSavings: potentialSavings, // Mantemos o seu cálculo exato
        goalProbability: goalProbability,   // Mantemos o seu cálculo exato
        insights: aiResponse.insights,
      };
    } catch (error) {
      console.error("Erro na análise de IA, usando fallback:", error);
      // Fallback para manter o sistema funcional se a API falhar
      return this.generateMockInsights(userId);
    }
  }

  /**
   * Detecta gastos atípicos em relação ao padrão histórico
   */
  async detectAnomalies(userId: string): Promise<IAnomaly[]> {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    const transactions = await this.transactionRepository.findByDateRange(
      userId,
      fourMonthsAgo,
      new Date()
    );

    const expenses = transactions.filter((t: any) => t.type === "expense");
    if (expenses.length === 0) return [];

    const monthlyByCategory = this.buildMonthlyCategoryExpenses(expenses);
    const currentMonth = new Date().toISOString().substring(0, 7);
    const months = Object.keys(monthlyByCategory).sort();
    const historicalMonths = months.filter((m) => m !== currentMonth);

    if (historicalMonths.length < 2) return [];

    const anomalies: IAnomaly[] = [];
    const currentData = monthlyByCategory[currentMonth];
    if (!currentData) return [];

    for (const [category, currentAmount] of Object.entries(currentData)) {
      const historicalAmounts = historicalMonths
        .map((m) => monthlyByCategory[m]?.[category] || 0)
        .filter((v) => v > 0);
      if (historicalAmounts.length < 2) continue;

      const average =
        historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length;
      const percentageIncrease =
        average > 0 ? ((currentAmount - average) / average) * 100 : 0;

      if (percentageIncrease >= 50) {
        anomalies.push({
          category,
          currentAmount,
          averageAmount: Math.round(average * 100) / 100,
          percentageIncrease: Math.round(percentageIncrease * 10) / 10,
          message: `Gasto com ${category} está ${Math.round(percentageIncrease)}% acima da sua média (R$ ${average.toFixed(2)}/mês). Valor atual: R$ ${currentAmount.toFixed(2)}.`,
        });
      }
    }

    return anomalies;
  }

  private buildMonthlyCategoryExpenses(expenses: any[]): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};

    for (const t of expenses) {
      const categoryName =
        (typeof t.category === "object" && t.category?.name) || String(t.category || "Outros");
      const month = new Date(t.date).toISOString().substring(0, 7);

      if (!result[month]) result[month] = {};
      result[month]![categoryName] = (result[month]![categoryName] || 0) + t.amount;
    }
    return result;
  }

  private readonly DAY_NAMES = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

  /**
   * Identifica padrões de consumo por dia da semana
   */
  async detectSpendingPatterns(userId: string): Promise<ISpendingPattern[]> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await this.transactionRepository.findByDateRange(
      userId,
      threeMonthsAgo,
      new Date()
    );

    const expenses = transactions.filter((t: any) => t.type === "expense");
    if (expenses.length === 0) return [];

    const byDay: Record<number, { total: number; count: number }> = {};
    for (let i = 0; i <= 6; i++) byDay[i] = { total: 0, count: 0 };

    for (const t of expenses) {
      const day = new Date(t.date).getDay();
      byDay[day]!.total += t.amount;
      byDay[day]!.count += 1;
    }

    const patterns: ISpendingPattern[] = [];

    for (let day = 0; day <= 6; day++) {
      const { total, count } = byDay[day]!;
      if (count === 0) continue;

      const averageAmount = total / count;
      patterns.push({
        pattern: `gastos às ${this.DAY_NAMES[day]}`,
        dayOfWeek: day,
        dayName: this.DAY_NAMES[day]!,
        averageAmount: Math.round(averageAmount * 100) / 100,
        transactionCount: count,
        description: `Média de R$ ${averageAmount.toFixed(2)} em ${count} transação(ões) às ${this.DAY_NAMES[day]}.`,
      });
    }

    return patterns.sort((a, b) => b.averageAmount - a.averageAmount);
  }

  /**
   * Previsão de gastos do próximo mês (média móvel dos meses anteriores)
   */
  async forecastNextMonthExpenses(userId: string): Promise<IExpenseForecast> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await this.transactionRepository.findByDateRange(
      userId,
      sixMonthsAgo,
      new Date()
    );

    const expenses = transactions.filter((t: any) => t.type === "expense");
    if (expenses.length === 0) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return {
        predictedTotal: 0,
        byCategory: {},
        confidence: 0,
        basedOnMonths: 0,
        nextMonth: nextMonth.toISOString().substring(0, 7),
      };
    }

    const monthlyByCategory = this.buildMonthlyCategoryExpenses(expenses);
    const months = Object.keys(monthlyByCategory).sort();

    const allCategories = new Set<string>();
    months.forEach((m) => Object.keys(monthlyByCategory[m] || {}).forEach((c) => allCategories.add(c)));

    const byCategory: Record<string, number> = {};
    let predictedTotal = 0;

    for (const cat of allCategories) {
      const values = months
        .map((m) => monthlyByCategory[m]?.[cat] || 0)
        .filter((v) => v > 0);
      const avg = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
      byCategory[cat] = Math.round(avg * 100) / 100;
      predictedTotal += byCategory[cat]!;
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const confidence = Math.min(0.95, 0.5 + months.length * 0.15);

    return {
      predictedTotal: Math.round(predictedTotal * 100) / 100,
      byCategory,
      confidence,
      basedOnMonths: months.length,
      nextMonth: nextMonth.toISOString().substring(0, 7),
    };
  }
  
  /**
   * Get AI interpretation
   * @param metrics - The financial metrics
   * @param goals - The user's goals
   * @param prob - The probability of goal achievement
   * @returns A promise that resolves to the AI interpretation
   */
  private async getAIInterpretation(metrics: IAnalysisMetrics, goals: any[], prob: number) {
    const prompt = `
      Atue como um analista financeiro sênior para o sistema M. Finnance AI.
      Analise os dados financeiros e retorne um objeto JSON estrito.

      Dados do Usuário:
      - Receita Mensal: R$ ${metrics.totalIncome}
      - Despesas: R$ ${metrics.totalExpenses}
      - Taxa de Poupança: ${(metrics.savingsRate * 100).toFixed(2)}%
      - Gastos por Categoria: ${JSON.stringify(metrics.categoryExpenses)}
      - Probabilidade de Metas: ${prob}%
      - Metas Ativas: ${goals.length}

      O JSON deve conter:
      1. "score": { "value": número de 300-850, "trend": "up" | "down" | "stable" }
      2. "insights": Array de objetos { "id": string, "type": "positive" | "warning" | "optimization", "title": string, "description": string, "impact": "high" | "medium" | "low" }
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "Você é um consultor financeiro que responde apenas em JSON." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  }

  /**
   * Generate intelligent insights using advanced algorithms
   * @param data - The data to generate insights from
   * @returns The financial insights
   */
  private generateMockInsights(data: any): IFinancialInsights {
    // Calculate financial metrics
    const metrics = this.calculateFinancialMetrics(data.transactions);
    const insights: IReportInsight[] = [];

    // Generate intelligent insights based on patterns
    this.generateSpendingInsights(metrics, insights);
    this.generateSavingsInsights(metrics, insights);
    this.generateGoalInsights(data.goals, metrics, insights);
    this.generateInvestmentInsights(metrics, insights);
    this.generateTrendInsights(data.transactions, insights);

    // Calculate advanced financial score
    const score = this.calculateAdvancedScore(metrics, data.goals);

    // Calculate potential savings based on patterns
    const potentialSavings = this.calculatePotentialSavings(metrics);

    // Calculate goal achievement probability
    const goalProbability = this.calculateGoalProbability(data.goals, metrics);

    return {
      score: {
        value: score.value,
        change: score.change,
      },
      health: this.getHealthStatus(score.value),
      potentialSavings,
      goalProbability,
      insights,
    };
  }

  /**
   * Calculate comprehensive financial metrics
   * @param transactions - The transactions to calculate metrics from
   * @returns The financial metrics
   */
  private calculateFinancialMetrics(transactions: any[]) {
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenses: Record<string, number> = {};
    const monthlyData: Record<string, { income: number; expenses: number }> =
      {};

    transactions.forEach((t: any) => {
      const month = new Date(t.date).toISOString().substring(0, 7);

      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (t.type === "income") {
        totalIncome += t.amount;
        monthlyData[month]!.income += t.amount;
      } else if (t.type === "expense") {
        totalExpenses += t.amount;
        monthlyData[month]!.expenses += t.amount;

        if (t.category) {
          categoryExpenses[t.category] =
            (categoryExpenses[t.category] || 0) + t.amount;
        }
      }
    });

    const savingsRate =
      totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    const expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;

    return {
      totalIncome,
      totalExpenses,
      categoryExpenses,
      monthlyData,
      savingsRate,
      expenseRatio,
      transactionCount: transactions.length,
    };
  }

  /**
   * Generate spending pattern insights
   * @param metrics - The financial metrics
   * @param insights - The insights to generate
   */
  private generateSpendingInsights(metrics: any, insights: IReportInsight[]) {
    const topCategories = Object.entries(metrics.categoryExpenses)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);

    // High spending category alert
    if (topCategories.length > 0) {
      const [topCategory, amount] = topCategories[0] as [string, number];
      const percentage = (amount / metrics.totalExpenses) * 100;

      if (percentage > 40) {
        insights.push({
          type: "optimization",
          title: "Categoria com Alto Gasto",
          description: `${topCategory} representa ${percentage.toFixed(1)}% dos seus gastos. Considere revisar seus gastos nesta categoria.`,
        });
      }
    }

    // Food delivery optimization
    const foodExpenses = metrics.categoryExpenses["Alimentação"] || 0;
    if (foodExpenses > metrics.totalIncome * 0.15) {
      insights.push({
        type: "optimization",
        title: "Otimização de Alimentação",
        description: `Seus gastos com alimentação estão altos. Sugerimos cozinhar mais em casa para economizar até R$ ${Math.round(foodExpenses * 0.3)} por mês.`,
      });
    }
  }

  /**
   * Generate savings insights
   * @param metrics - The financial metrics
   * @param insights - The insights to generate
   */
  private generateSavingsInsights(metrics: any, insights: IReportInsight[]) {
    if (metrics.savingsRate > 0.2) {
      insights.push({
        type: "positive",
        title: "Excelente Taxa de Poupança",
        description: `Você está poupando ${(metrics.savingsRate * 100).toFixed(1)}% da sua renda. Continue assim!`,
      });
    } else if (metrics.savingsRate < 0.1) {
      insights.push({
        type: "warning",
        title: "Baixa Taxa de Poupança",
        description: `Sua taxa de poupança está em ${(metrics.savingsRate * 100).toFixed(1)}%. Recomendamos aumentar para pelo menos 10%.`,
      });
    }
  }

  /**
   * Generate goal-related insights
   * @param goals - The user's goals
   * @param metrics - The financial metrics
   * @param insights - The insights to generate
   */
  private generateGoalInsights(
    goals: any[],
    metrics: any,
    insights: IReportInsight[]
  ) {
    if (goals.length === 0) {
      insights.push({
        type: "suggestion",
        title: "Defina Metas Financeiras",
        description:
          "Estabelecer metas financeiras pode aumentar sua motivação para poupar. Que tal começar com uma meta de emergência?",
      });
      return;
    }

    goals.forEach((goal: any) => {
      const monthlyContribution =
        (goal.targetAmount - goal.currentAmount) /
        Math.max(
          1,
          Math.ceil(
            (new Date(goal.targetDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24 * 30)
          )
        );

      if (monthlyContribution > metrics.totalIncome * 0.3) {
        insights.push({
          type: "warning",
          title: "Meta Muito Agressiva",
          description: `Para atingir sua meta "${goal.name}", você precisaria poupar ${((monthlyContribution / metrics.totalIncome) * 100).toFixed(1)}% da sua renda. Considere ajustar o prazo.`,
        });
      }
    });
  }

  /**
   * Generate investment insights
   * @param metrics - The financial metrics
   * @param insights - The insights to generate
   */
  private generateInvestmentInsights(metrics: any, insights: IReportInsight[]) {
    if (metrics.savingsRate > 0.15) {
      insights.push({
        type: "investment",
        title: "Oportunidade de Investimento",
        description: `Com ${(metrics.savingsRate * 100).toFixed(1)}% de taxa de poupança, você pode considerar investir em fundos de renda fixa ou CDB.`,
      });
    }
  }

  /**
   * Generate trend insights
   * @param transactions - The transactions to generate insights from
   * @param insights - The insights to generate
   */
  private generateTrendInsights(
    transactions: any[],
    insights: IReportInsight[]
  ) {
    const monthlyTrends = this.calculateMonthlyTrends(transactions);

    if (monthlyTrends.expenseGrowth > 0.1) {
      insights.push({
        type: "warning",
        title: "Crescimento nos Gastos",
        description: `Seus gastos aumentaram ${(monthlyTrends.expenseGrowth * 100).toFixed(1)}% no último mês. Revise seus gastos para manter o controle.`,
      });
    }
  }

  /**
   * Calculate monthly trends
   * @param transactions - The transactions to calculate trends from
   * @returns The monthly trends
   */
  private calculateMonthlyTrends(transactions: any[]) {
    const monthlyData: Record<string, { income: number; expenses: number }> =
      {};

    transactions.forEach((t: any) => {
      const month = new Date(t.date).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (t.type === "income") {
        monthlyData[month]!.income += t.amount;
      } else if (t.type === "expense") {
        monthlyData[month]!.expenses += t.amount;
      }
    });

    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) {
      return { incomeGrowth: 0, expenseGrowth: 0 };
    }

    const lastMonthKey = months[months.length - 1];
    const previousMonthKey = months[months.length - 2];

    if (!lastMonthKey || !previousMonthKey) {
      return { incomeGrowth: 0, expenseGrowth: 0 };
    }

    const lastMonth = monthlyData[lastMonthKey];
    const previousMonth = monthlyData[previousMonthKey];

    if (!lastMonth || !previousMonth) {
      return { incomeGrowth: 0, expenseGrowth: 0 };
    }

    const incomeGrowth =
      previousMonth.income > 0
        ? (lastMonth.income - previousMonth.income) / previousMonth.income
        : 0;
    const expenseGrowth =
      previousMonth.expenses > 0
        ? (lastMonth.expenses - previousMonth.expenses) / previousMonth.expenses
        : 0;

    return { incomeGrowth, expenseGrowth };
  }

  /**
   * Calculate advanced financial score
   * @param metrics - The financial metrics
   * @param goals - The user's goals
   * @returns The advanced financial score
   */
  private calculateAdvancedScore(metrics: any, goals: any[]) {
    let score = 500; // Base score

    // Savings rate impact (40% of score)
    score += metrics.savingsRate * 200;

    // Expense ratio impact (30% of score)
    if (metrics.expenseRatio < 0.7) score += 100;
    else if (metrics.expenseRatio < 0.9) score += 50;
    else score -= 50;

    // Goals impact (20% of score)
    if (goals.length > 0) score += 50;

    // Transaction frequency (10% of score)
    if (metrics.transactionCount > 20) score += 30;

    // Cap the score
    score = Math.min(850, Math.max(300, Math.round(score)));

    // Calculate change (simulate previous score)
    const previousScore = Math.max(
      300,
      score - Math.round(Math.random() * 50 - 25)
    );
    const change = score - previousScore;

    return { value: score, change };
  }

  /**
   * Calculate potential savings
   * @param metrics - The financial metrics
   * @returns The potential savings
    */
  private calculatePotentialSavings(metrics: any) {
    // Identify potential savings based on spending patterns
    const topCategories = Object.entries(metrics.categoryExpenses).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    );

    let potentialSavings = 0;

    // Food delivery optimization
    const foodExpenses = metrics.categoryExpenses["Alimentação"] || 0;
    if (foodExpenses > metrics.totalIncome * 0.1) {
      potentialSavings += foodExpenses * 0.3;
    }

    // Subscription optimization
    const subscriptionExpenses = metrics.categoryExpenses["Assinaturas"] || 0;
    if (subscriptionExpenses > 0) {
      potentialSavings += subscriptionExpenses * 0.2;
    }

    return Math.round(potentialSavings * 100) / 100;
  }

  /**
   * Calculate goal achievement probability
   * @param goals - The user's goals
   * @param metrics - The financial metrics
   * @returns The goal achievement probability
   */
  private calculateGoalProbability(goals: any[], metrics: any) {
    if (goals.length === 0) return 0;

    const totalGoalAmount = goals.reduce(
      (sum, goal) => sum + (goal.targetAmount - goal.currentAmount),
      0
    );
    const monthlySavings = metrics.totalIncome * metrics.savingsRate;

    if (monthlySavings <= 0) return 0;

    const monthsNeeded = totalGoalAmount / monthlySavings;
    const monthsAvailable = goals.reduce((min, goal) => {
      const goalMonths = Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      return Math.min(min, goalMonths);
    }, Infinity);

    const probability = Math.min(
      99,
      Math.max(0, Math.round((monthsAvailable / monthsNeeded) * 100))
    );
    return probability;
  }

  /**
   * Get health status based on score
   * @param score - The financial score
   * @returns The health status
   */
  private getHealthStatus(score: number) {
    if (score >= 750) return "Excelente";
    if (score >= 650) return "Ótima";
    if (score >= 550) return "Boa";
    if (score >= 450) return "Regular";
    return "Precisa de atenção";
  }
}
