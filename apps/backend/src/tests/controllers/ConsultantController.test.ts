import { Request, Response } from "express";
import { ConsultantController } from "../../controllers/ConsultantController";

const mockChat = jest.fn();

const mockFinancialConsultantService = {
  chat: mockChat,
};

describe("ConsultantController", () => {
  let controller: ConsultantController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ConsultantController(
      mockFinancialConsultantService as any
    );
    mockRequest = {
      body: {},
      user: { _id: "user-1" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("chat", () => {
    it("deve retornar resposta do consultor", async () => {
      mockRequest.body = { message: "Como melhorar meu score?" };
      mockChat.mockResolvedValue({
        reply: "Com base nos seus dados, recomendo aumentar a poupança.",
      });

      await controller.chat(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockChat).toHaveBeenCalledWith(
        "user-1",
        "Como melhorar meu score?",
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { reply: expect.any(String) },
        })
      );
    });

    it("deve retornar 401 quando usuário não está autenticado", async () => {
      mockRequest.user = undefined;
      mockRequest.body = { message: "Olá" };

      await controller.chat(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockChat).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("deve retornar 400 quando mensagem está vazia", async () => {
      mockRequest.body = { message: "   " };

      await controller.chat(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockChat).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
