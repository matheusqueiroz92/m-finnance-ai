import { Request, Response } from "express";
import { ConsultantController } from "../../controllers/ConsultantController";

const mockChat = jest.fn();
const mockCreate = jest.fn();
const mockFindByUser = jest.fn();
const mockFindByIdWithMessages = jest.fn();
const mockFindById = jest.fn();
const mockAddMessage = jest.fn();
const mockUpdateTitle = jest.fn();

const mockFinancialConsultantService = { chat: mockChat };

const mockConsultantSessionRepository = {
  create: mockCreate,
  findByUser: mockFindByUser,
  findById: mockFindById,
  findByIdWithMessages: mockFindByIdWithMessages,
  addMessage: mockAddMessage,
  updateTitle: mockUpdateTitle,
  delete: jest.fn(),
};

describe("ConsultantController", () => {
  let controller: ConsultantController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ConsultantController(
      mockFinancialConsultantService as any,
      mockConsultantSessionRepository as any
    );
    mockRequest = {
      body: {},
      params: {},
      user: { _id: "user-1" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("createSession", () => {
    it("deve criar sessão e retornar sessionId", async () => {
      mockCreate.mockResolvedValue({
        _id: "sess-123",
        title: "Nova conversa",
        user: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await controller.createSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreate).toHaveBeenCalledWith("user-1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { sessionId: "sess-123", title: "Nova conversa" },
        })
      );
    });

    it("deve retornar 401 quando não autenticado", async () => {
      mockRequest.user = undefined;
      await controller.createSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getSessions", () => {
    it("deve listar sessões do usuário", async () => {
      mockFindByUser.mockResolvedValue([
        { _id: "sess-1", title: "Conversa 1", user: "user-1", createdAt: new Date(), updatedAt: new Date() },
      ]);

      await controller.getSessions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByUser).toHaveBeenCalledWith("user-1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { sessions: expect.any(Array) },
        })
      );
    });
  });

  describe("getSessionById", () => {
    it("deve retornar sessão com mensagens", async () => {
      mockRequest.params = { id: "sess-123" };
      mockFindByIdWithMessages.mockResolvedValue({
        _id: "sess-123",
        title: "Minha conversa",
        user: "user-1",
        messages: [{ role: "user", content: "Olá", createdAt: new Date() }],
      });

      await controller.getSessionById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByIdWithMessages).toHaveBeenCalledWith("sess-123", "user-1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { session: expect.any(Object) },
        })
      );
    });

    it("deve retornar 404 quando sessão não existe", async () => {
      mockRequest.params = { id: "sess-invalid" };
      mockFindByIdWithMessages.mockResolvedValue(null);

      await controller.getSessionById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("chat", () => {
    it("deve retornar resposta do consultor sem sessionId", async () => {
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
        [],
        true
      );
      expect(mockAddMessage).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { reply: expect.any(String) },
        })
      );
    });

    it("deve persistir mensagens quando sessionId é enviado", async () => {
      mockRequest.body = { message: "Olá", sessionId: "sess-123" };
      mockFindByIdWithMessages.mockResolvedValue({
        _id: "sess-123",
        title: "Nova conversa",
        user: "user-1",
        messages: [],
      });
      mockFindById.mockResolvedValue({ title: "Nova conversa", _id: "sess-123" });
      mockChat.mockResolvedValue({ reply: "Olá! Como posso ajudar?" });

      await controller.chat(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByIdWithMessages).toHaveBeenCalledWith("sess-123", "user-1");
      expect(mockChat).toHaveBeenCalledWith("user-1", "Olá", [], true);
      expect(mockAddMessage).toHaveBeenCalledWith("sess-123", "user-1", "user", "Olá");
      expect(mockAddMessage).toHaveBeenCalledWith(
        "sess-123",
        "user-1",
        "assistant",
        "Olá! Como posso ajudar?"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { reply: "Olá! Como posso ajudar?", sessionId: "sess-123" },
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

    it("deve retornar 404 quando sessionId não existe", async () => {
      mockRequest.body = { message: "Olá", sessionId: "sess-invalid" };
      mockFindByIdWithMessages.mockResolvedValue(null);

      await controller.chat(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockChat).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
