import { injectable, inject } from "tsyringe";
import {
  IFinancialConsultantService,
  IConsultantMessage,
} from "../interfaces/services/IFinancialConsultantService";
import { ITransactionRepository } from "../interfaces/repositories/ITransactionRepository";
import { IGoalRepository } from "../interfaces/repositories/IGoalRepository";
import OpenAI from "openai";

@injectable()
export class FinancialConsultantService implements IFinancialConsultantService {
  private openai: OpenAI;

  constructor(
    @inject("TransactionRepository")
    private transactionRepository: ITransactionRepository,
    @inject("GoalRepository")
    private goalRepository: IGoalRepository
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(
    userId: string,
    message: string,
    history: IConsultantMessage[] = [],
    useUserContext: boolean = true
  ): Promise<{ reply: string }> {
    const systemContent = useUserContext
      ? await this.buildSystemPromptWithContext(userId)
      : this.getGenericSystemPrompt();

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemContent },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await this.openai.chat.completions.create({
      model: process.env.AI_CONSULTANT_MODEL || "gpt-4o-mini",
      messages,
      max_tokens: 1024,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "Desculpe, não consegui processar sua pergunta. Tente reformular.";

    return { reply };
  }

  private getGenericSystemPrompt(): string {
    return `Você é um consultor financeiro do sistema M. Finnance AI. Responda em português brasileiro, de forma clara e objetiva.
O usuário está em modo "dúvidas gerais": NÃO há acesso aos dados pessoais dele. Responda com educação financeira, conceitos e dicas genéricas.
Tópicos adequados: poupança, investimentos básicos, planejamento 50/30/20, reserva de emergência, como reduzir gastos em geral, quando priorizar dívidas vs investimentos.
Não invente valores ou situações específicas do usuário.`;
  }

  private async buildSystemPromptWithContext(userId: string): Promise<string> {
    const context = await this.buildContext(userId);
    return `Você é um consultor financeiro do sistema M. Finnance AI. Responda em português brasileiro, de forma clara e objetiva.
Use APENAS as informações do contexto do usuário abaixo para personalizar suas respostas. Não invente valores ou dados.
Se o usuário perguntar sobre score, metas, gastos ou investimentos, baseie-se no contexto.
Contexto do usuário (últimos 3 meses):
${context}`;
  }

  private async buildContext(userId: string): Promise<string> {
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

    const income = transactions.filter((t: any) => t.type === "income");
    const expenses = transactions.filter((t: any) => t.type === "expense");
    const totalIncome = income.reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpenses = expenses.reduce((s: number, t: any) => s + t.amount, 0);
    const avgIncome = income.length > 0 ? totalIncome / 3 : 0;
    const avgExpenses = expenses.length > 0 ? totalExpenses / 3 : 0;
    const savingsRate =
      avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;

    const categoryTotals: Record<string, number> = {};
    expenses.forEach((t: any) => {
      const name = (t.category?.name || "Outros").trim();
      categoryTotals[name] = (categoryTotals[name] || 0) + t.amount;
    });
    const categoryLines = Object.entries(categoryTotals)
      .map(([name, value]) => `  - ${name}: R$ ${value.toFixed(2)}`)
      .join("\n");

    const goalLines =
      goals.length > 0
        ? goals
            .map(
              (g: any) =>
                `  - ${g.name}: R$ ${g.currentAmount?.toFixed(2) || 0} / R$ ${g.targetAmount?.toFixed(2)} (meta)`
            )
            .join("\n")
        : "  Nenhuma meta cadastrada.";

    return [
      `Renda média (3 meses): R$ ${avgIncome.toFixed(2)}`,
      `Gastos médios (3 meses): R$ ${avgExpenses.toFixed(2)}`,
      `Taxa de poupança: ${savingsRate.toFixed(1)}%`,
      "Gastos por categoria:",
      categoryLines || "  Nenhum dado.",
      "Metas:",
      goalLines,
    ].join("\n");
  }
}
