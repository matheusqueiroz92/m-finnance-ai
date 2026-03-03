import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IFinancialConsultantService } from "../interfaces/services/IFinancialConsultantService";
import { IConsultantSessionRepository } from "../interfaces/repositories/IConsultantSessionRepository";
import { ApiResponse } from "../utils/ApiResponse";

const TITLE_MAX_LENGTH = 80;

@injectable()
export class ConsultantController {
  constructor(
    @inject("FinancialConsultantService")
    private financialConsultantService: IFinancialConsultantService,
    @inject("ConsultantSessionRepository")
    private consultantSessionRepository: IConsultantSessionRepository
  ) {}

  createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }
    try {
      const userId = (req.user as any)._id.toString();
      const session = await this.consultantSessionRepository.create(userId);
      const sessionId = String((session as any)._id);
      ApiResponse.success(
        res,
        { sessionId, title: session.title },
        "Sessão criada"
      );
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }
    try {
      const userId = (req.user as any)._id.toString();
      const sessions = await this.consultantSessionRepository.findByUser(userId);
      ApiResponse.success(res, { sessions }, "Sessões listadas");
    } catch (error) {
      next(error);
    }
  };

  getSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }
    try {
      const userId = (req.user as any)._id.toString();
      const sessionId = req.params.id as string;
      if (!sessionId) {
        ApiResponse.error(res, "ID da sessão é obrigatório", 400);
        return;
      }
      const session = await this.consultantSessionRepository.findByIdWithMessages(
        sessionId,
        userId
      );
      if (!session) {
        ApiResponse.error(res, "Sessão não encontrada", 404);
        return;
      }
      ApiResponse.success(res, { session }, "Sessão carregada");
    } catch (error) {
      next(error);
    }
  };

  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ApiResponse.error(res, "Usuário não autenticado", 401);
      return;
    }

    try {
      const userId = (req.user as any)._id.toString();
      const { message, history: bodyHistory, useUserContext, sessionId } = req.body as {
        message: string;
        history?: { role: "user" | "assistant"; content: string }[];
        useUserContext?: boolean;
        sessionId?: string;
      };

      if (!message || typeof message !== "string" || !message.trim()) {
        ApiResponse.error(res, "Mensagem é obrigatória", 400);
        return;
      }

      let history = bodyHistory ?? [];

      if (sessionId) {
        const session = await this.consultantSessionRepository.findByIdWithMessages(
          sessionId,
          userId
        );
        if (!session) {
          ApiResponse.error(res, "Sessão não encontrada", 404);
          return;
        }
        history = session.messages.map((m) => ({ role: m.role, content: m.content }));
      }

      const result = await this.financialConsultantService.chat(
        userId,
        message.trim(),
        history,
        useUserContext !== false
      );

      const payload: { reply: string; sessionId?: string } = { reply: result.reply };

      if (sessionId) {
        await this.consultantSessionRepository.addMessage(
          sessionId,
          userId,
          "user",
          message.trim()
        );
        await this.consultantSessionRepository.addMessage(
          sessionId,
          userId,
          "assistant",
          result.reply
        );
        const session = await this.consultantSessionRepository.findById(sessionId, userId);
        if (session && session.title === "Nova conversa") {
          const title =
            message.trim().length > TITLE_MAX_LENGTH
              ? message.trim().slice(0, TITLE_MAX_LENGTH) + "..."
              : message.trim();
          await this.consultantSessionRepository.updateTitle(sessionId, userId, title);
        }
        payload.sessionId = sessionId;
      }

      ApiResponse.success(res, payload, "Resposta gerada com sucesso");
    } catch (error) {
      next(error);
    }
  };
}
