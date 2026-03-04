import {
  IExpenseMessageParser,
  IParsedExpense,
} from "../interfaces/utils/IExpenseMessageParser";
import { ExpenseMessageParser } from "./ExpenseMessageParser";
import OpenAI from "openai";

/**
 * Parser híbrido: tenta regex primeiro (rápido); se falhar, usa IA para extrair valor, descrição e data.
 */
export class HybridExpenseMessageParser implements IExpenseMessageParser {
  private regexParser = new ExpenseMessageParser();
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async parse(message: string): Promise<IParsedExpense | null> {
    const trimmed = (message || "").trim();
    if (!trimmed) return null;

    const regexResult = await this.regexParser.parse(trimmed);
    if (regexResult) return regexResult;

    if (this.openai) {
      try {
        return await this.parseWithAI(trimmed);
      } catch (err) {
        console.warn("[HybridExpenseMessageParser] AI fallback failed:", err);
      }
    }
    return null;
  }

  isValidExpenseMessage(message: string): boolean {
    if (this.regexParser.isValidExpenseMessage(message)) return true;
    const trimmed = (message || "").trim();
    if (!trimmed || trimmed.length < 5) return false;
    return /\d+/.test(trimmed);
  }

  private async parseWithAI(message: string): Promise<IParsedExpense | null> {
    if (!this.openai) return null;

    const prompt = `Extraia da mensagem abaixo (em português, sobre uma despesa/gasto) APENAS:
1. amount: valor em reais (número, ex: 45.90)
2. description: descrição curta (ex: almoço, uber)
3. dateKeyword: "hoje", "ontem" ou null (se não mencionado, use hoje)

Mensagem: "${message}"

Responda SOMENTE com um JSON válido, sem markdown, no formato: {"amount": number, "description": "string", "dateKeyword": "hoje"|"ontem"|null, "suggestedCategoryName": "string ou null"}`;

    const completion = await this.openai.chat.completions.create({
      model: process.env.AI_EXPENSE_PARSER_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;

    const jsonStr = content.replace(/^```json\s*|\s*```$/g, "").trim();
    let data: { amount?: number; description?: string; dateKeyword?: string | null; suggestedCategoryName?: string | null };
    try {
      data = JSON.parse(jsonStr);
    } catch {
      return null;
    }

    const amount = typeof data.amount === "number" ? data.amount : parseFloat(String(data.amount));
    if (isNaN(amount) || amount <= 0) return null;

    const description = (data.description && String(data.description).trim()) || "Despesa";
    const date = this.resolveDate(data.dateKeyword);

    return {
      amount,
      description,
      date,
      rawMessage: message,
      suggestedCategoryName: data.suggestedCategoryName ? String(data.suggestedCategoryName) : undefined,
    };
  }

  private resolveDate(keyword: string | null | undefined): Date {
    const today = new Date();
    if (!keyword) return today;
    const k = keyword.toLowerCase();
    if (k === "ontem" || k === "yesterday") {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return d;
    }
    return today;
  }
}
