import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IFinancialPlanningService } from "../interfaces/services/IFinancialPlanningService";
import { ApiResponse } from "../utils/ApiResponse";

@injectable()
export class PlanningController {
  constructor(
    @inject("FinancialPlanningService")
    private financialPlanningService: IFinancialPlanningService
  ) {}

  getPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const plan = await this.financialPlanningService.getPlan((req.user as any)._id);
      ApiResponse.success(res, plan, "Plano financeiro gerado com sucesso");
    } catch (error) {
      next(error);
    }
  };

  simulateScenario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const savingsPercent = Number(req.query.savingsPercent) || 20;
      const months = Number(req.query.months) || 12;

      const result = await this.financialPlanningService.simulateScenario(
        (req.user as any)._id,
        Math.min(100, Math.max(0, savingsPercent)),
        Math.min(120, Math.max(1, months))
      );
      ApiResponse.success(res, result, "Simulação gerada com sucesso");
    } catch (error) {
      next(error);
    }
  };

  getAdherence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const adherence = await this.financialPlanningService.getAdherence((req.user as any)._id);
      ApiResponse.success(res, adherence, "Aderência calculada com sucesso");
    } catch (error) {
      next(error);
    }
  };
}
