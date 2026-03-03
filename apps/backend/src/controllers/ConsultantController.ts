import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IFinancialConsultantService } from "../interfaces/services/IFinancialConsultantService";
import { ApiResponse } from "../utils/ApiResponse";

@injectable()
export class ConsultantController {
  constructor(
    @inject("FinancialConsultantService")
    private financialConsultantService: IFinancialConsultantService
  ) {}

  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const { message, history, useUserContext } = req.body as {
        message: string;
        history?: { role: "user" | "assistant"; content: string }[];
        useUserContext?: boolean;
      };

      if (!message || typeof message !== "string" || !message.trim()) {
        ApiResponse.error(res, "Mensagem é obrigatória", 400);
        return;
      }

      const result = await this.financialConsultantService.chat(
        (req.user as any)._id,
        message.trim(),
        history,
        useUserContext !== false
      );

      ApiResponse.success(res, result, "Resposta gerada com sucesso");
    } catch (error) {
      next(error);
    }
  };
}
