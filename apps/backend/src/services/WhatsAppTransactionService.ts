import { injectable, inject } from "tsyringe";
import { IWhatsAppTransactionService, IWhatsAppProcessResult } from "../interfaces/services/IWhatsAppTransactionService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { ITransactionService } from "../interfaces/services/ITransactionService";
import { IAccountRepository } from "../interfaces/repositories/IAccountRepository";
import { ICategoryRepository } from "../interfaces/repositories/ICategoryRepository";
import { IExpenseMessageParser } from "../interfaces/utils/IExpenseMessageParser";

const DEFAULT_EXPENSE_CATEGORY_NAME = "Outras despesas";

@injectable()
export class WhatsAppTransactionService implements IWhatsAppTransactionService {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
    @inject("TransactionService")
    private transactionService: ITransactionService,
    @inject("AccountRepository")
    private accountRepository: IAccountRepository,
    @inject("CategoryRepository")
    private categoryRepository: ICategoryRepository,
    @inject("ExpenseMessageParser")
    private parser: IExpenseMessageParser
  ) {}

  async processIncomingMessage(from: string, body: string): Promise<IWhatsAppProcessResult> {
    const trimmedBody = (body || "").trim();
    if (!trimmedBody) {
      return {
        success: false,
        message: "Envie uma mensagem no formato: descrição valor (ex: almoço 45,90)",
      };
    }

    const user = await this.userRepository.findByPhone(from);
    if (!user) {
      return {
        success: false,
        message: "Número não vinculado a nenhuma conta. Vincule seu WhatsApp nas configurações do app.",
      };
    }

    const parsed = await this.parser.parse(trimmedBody);
    if (!parsed) {
      return {
        success: false,
        message: "Não consegui entender. Use: descrição e valor (ex: almoço 45,90 ou uber 22 ontem).",
      };
    }

    const userId = (user as any)._id.toString();
    const [account, categories] = await Promise.all([
      this.accountRepository.findByUser(userId),
      this.categoryRepository.findByUser(userId, "expense"),
    ]);

    const defaultAccount = account[0];
    if (!defaultAccount) {
      return {
        success: false,
        message: "Cadastre uma conta no app antes de registrar despesas pelo WhatsApp.",
      };
    }

    const preferredName = parsed.suggestedCategoryName || DEFAULT_EXPENSE_CATEGORY_NAME;
    const category =
      categories.find((c) => c.name === preferredName) ||
      categories.find((c) => c.name === DEFAULT_EXPENSE_CATEGORY_NAME) ||
      categories[0];
    if (!category) {
      return {
        success: false,
        message: "Nenhuma categoria de despesa encontrada. Acesse o app para configurar.",
      };
    }

    try {
      await this.transactionService.createTransaction(userId, {
        account: (defaultAccount as any)._id.toString(),
        category: (category as any)._id.toString(),
        amount: parsed.amount,
        type: "expense",
        description: parsed.description,
        date: parsed.date.toISOString(),
      });

      return {
        success: true,
        message: `Despesa registrada: ${parsed.description} R$ ${parsed.amount.toFixed(2)} (${parsed.date.toLocaleDateString("pt-BR")}).`,
      };
    } catch (error) {
      console.error("[WhatsAppTransactionService] Erro ao criar transação:", error);
      return {
        success: false,
        message: "Não foi possível registrar a despesa. Tente novamente ou cadastre pelo app.",
      };
    }
  }
}
