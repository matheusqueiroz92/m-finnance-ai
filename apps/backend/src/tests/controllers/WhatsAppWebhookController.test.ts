/**
 * F3-06: Testes do webhook com payloads reais (formato Twilio).
 */
import { Request, Response, NextFunction } from "express";
import { WhatsAppWebhookController } from "../../controllers/WhatsAppWebhookController";

const mockProcessIncomingMessage = jest.fn();
const mockWhatsAppTransactionService = {
  processIncomingMessage: mockProcessIncomingMessage,
};

describe("WhatsAppWebhookController", () => {
  let controller: WhatsAppWebhookController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new WhatsAppWebhookController(
      mockWhatsAppTransactionService as any
    );
    mockRequest = { body: {} };
    mockResponse = {
      type: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("handleIncomingMessage - cenários de payload real", () => {
    it("responde com TwiML quando Body e From são enviados (despesa válida)", async () => {
      mockProcessIncomingMessage.mockResolvedValue({
        success: true,
        message: "Despesa registrada: almoço R$ 45.90 (02/03/2025).",
      });
      mockRequest.body = {
        From: "whatsapp:+5511999999999",
        Body: "almoço 45,90",
        To: "whatsapp:+14155238886",
        MessageSid: "SM123",
      };

      await controller.handleIncomingMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProcessIncomingMessage).toHaveBeenCalledWith(
        "whatsapp:+5511999999999",
        "almoço 45,90"
      );
      expect(mockResponse.type).toHaveBeenCalledWith("text/xml");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const sent = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sent).toContain("<?xml");
      expect(sent).toContain("Despesa registrada");
      expect(sent).toContain("45.90");
    });

    it("responde com TwiML de erro quando número não vinculado", async () => {
      mockProcessIncomingMessage.mockResolvedValue({
        success: false,
        message:
          "Número não vinculado a nenhuma conta. Vincule seu WhatsApp nas configurações do app.",
      });
      mockRequest.body = {
        From: "whatsapp:+5511888888888",
        Body: "uber 22",
      };

      await controller.handleIncomingMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProcessIncomingMessage).toHaveBeenCalledWith(
        "whatsapp:+5511888888888",
        "uber 22"
      );
      const sent = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sent).toContain("não vinculado");
    });

    it("responde com TwiML quando mensagem não é entendida", async () => {
      mockProcessIncomingMessage.mockResolvedValue({
        success: false,
        message:
          "Não consegui entender. Use: descrição e valor (ex: almoço 45,90 ou uber 22 ontem).",
      });
      mockRequest.body = {
        From: "whatsapp:+5511999999999",
        Body: "oi, tudo bem?",
      };

      await controller.handleIncomingMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const sent = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sent).toContain("Não consegui entender");
    });

    it("trata Body e From ausentes (strings vazias)", async () => {
      mockProcessIncomingMessage.mockResolvedValue({
        success: false,
        message: "Envie uma mensagem no formato: descrição valor (ex: almoço 45,90)",
      });
      mockRequest.body = {};

      await controller.handleIncomingMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockProcessIncomingMessage).toHaveBeenCalledWith("", "");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("chama next quando o serviço lança erro", async () => {
      mockProcessIncomingMessage.mockRejectedValue(new Error("DB error"));
      mockRequest.body = {
        From: "whatsapp:+5511999999999",
        Body: "almoço 45,90",
      };

      await controller.handleIncomingMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.send).not.toHaveBeenCalled();
    });
  });
});
