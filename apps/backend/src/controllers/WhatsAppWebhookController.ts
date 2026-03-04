import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import twilio from "twilio";
import { IWhatsAppTransactionService } from "../interfaces/services/IWhatsAppTransactionService";

/**
 * Controller do webhook Twilio para mensagens WhatsApp recebidas.
 * Processa mensagens com WhatsAppTransactionService (parser + criação de transação).
 */
@injectable()
export class WhatsAppWebhookController {
  constructor(
    @inject("WhatsAppTransactionService")
    private whatsAppTransactionService: IWhatsAppTransactionService
  ) {}

  /**
   * Recebe POST do Twilio quando chega uma mensagem no WhatsApp.
   * Body (application/x-www-form-urlencoded): From, To, Body, MessageSid, etc.
   */
  handleIncomingMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { Body: body, From: from } = req.body as {
        Body?: string;
        From?: string;
      };

      const result = await this.whatsAppTransactionService.processIncomingMessage(
        from || "",
        body || ""
      );

      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(result.message);

      res.type("text/xml").status(200).send(twiml.toString());
    } catch (error) {
      next(error);
    }
  };
}
