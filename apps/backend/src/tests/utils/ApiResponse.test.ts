import { ApiResponse } from "../../utils/ApiResponse";
import { Response } from "express";

describe("ApiResponse", () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("success", () => {
    it("should send success response with default values", () => {
      const data = { id: 1, name: "Test" };

      ApiResponse.success(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Operação realizada com sucesso",
        data,
        timestamp: expect.any(String),
      });
    });

    it("should send success response with custom message", () => {
      const data = { id: 1, name: "Test" };
      const message = "Usuário criado com sucesso";

      ApiResponse.success(mockResponse as Response, data, message);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        timestamp: expect.any(String),
      });
    });

    it("should send success response with custom status code", () => {
      const data = { id: 1, name: "Test" };
      const message = "Recurso criado";
      const statusCode = 201;

      ApiResponse.success(mockResponse as Response, data, message, statusCode);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        timestamp: expect.any(String),
      });
    });

    it("should include valid ISO timestamp", () => {
      const data = { id: 1 };
      const beforeCall = new Date().toISOString();

      ApiResponse.success(mockResponse as Response, data);

      const afterCall = new Date().toISOString();
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(responseCall.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(new Date(responseCall.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeCall).getTime()
      );
      expect(new Date(responseCall.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(afterCall).getTime()
      );
    });

    it("should handle null and undefined data", () => {
      ApiResponse.success(mockResponse as Response, null);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Operação realizada com sucesso",
        data: null,
        timestamp: expect.any(String),
      });

      ApiResponse.success(mockResponse as Response, undefined);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Operação realizada com sucesso",
        data: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe("error", () => {
    it("should send error response with default values", () => {
      ApiResponse.error(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erro interno do servidor",
        timestamp: expect.any(String),
      });
    });

    it("should send error response with custom message", () => {
      const message = "Usuário não encontrado";

      ApiResponse.error(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });

    it("should send error response with custom status code", () => {
      const message = "Dados inválidos";
      const statusCode = 400;

      ApiResponse.error(mockResponse as Response, message, statusCode);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });

    it("should send error response with validation errors", () => {
      const message = "Dados inválidos";
      const statusCode = 400;
      const errors = [
        { field: "email", message: "Email é obrigatório" },
        {
          field: "password",
          message: "Senha deve ter pelo menos 6 caracteres",
        },
      ];

      ApiResponse.error(mockResponse as Response, message, statusCode, errors);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        errors,
        timestamp: expect.any(String),
      });
    });

    it("should include valid ISO timestamp", () => {
      const beforeCall = new Date().toISOString();

      ApiResponse.error(mockResponse as Response);

      const afterCall = new Date().toISOString();
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(responseCall.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(new Date(responseCall.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeCall).getTime()
      );
      expect(new Date(responseCall.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(afterCall).getTime()
      );
    });

    it("should handle empty errors array", () => {
      const message = "Erro de validação";
      const errors: any[] = [];

      ApiResponse.error(mockResponse as Response, message, 400, errors);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        errors: [],
        timestamp: expect.any(String),
      });
    });

    it("should handle undefined errors", () => {
      const message = "Erro genérico";

      ApiResponse.error(mockResponse as Response, message, 500, undefined);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });
  });

  describe("created", () => {
    it("should send created response with default values", () => {
      const data = { id: 1, name: "New User" };

      ApiResponse.created(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Recurso criado com sucesso",
        data,
        timestamp: expect.any(String),
      });
    });

    it("should send created response with custom message", () => {
      const data = { id: 2, title: "New Post" };
      const message = "Post criado com sucesso";

      ApiResponse.created(mockResponse as Response, data, message);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        timestamp: expect.any(String),
      });
    });
  });

  describe("notFound", () => {
    it("should send not found response with default message", () => {
      ApiResponse.notFound(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Recurso não encontrado",
        timestamp: expect.any(String),
      });
    });

    it("should send not found response with custom message", () => {
      const message = "Usuário não encontrado";

      ApiResponse.notFound(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });
  });

  describe("badRequest", () => {
    it("should send bad request response with default message", () => {
      ApiResponse.badRequest(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Requisição inválida",
        timestamp: expect.any(String),
      });
    });

    it("should send bad request response with custom message", () => {
      const message = "Dados de entrada inválidos";

      ApiResponse.badRequest(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });

    it("should send bad request response with validation errors", () => {
      const message = "Dados de entrada inválidos";
      const errors = [
        { field: "email", message: "Email é obrigatório" },
        {
          field: "password",
          message: "Senha deve ter pelo menos 6 caracteres",
        },
      ];

      ApiResponse.badRequest(mockResponse as Response, message, errors);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        errors,
        timestamp: expect.any(String),
      });
    });
  });

  describe("unauthorized", () => {
    it("should send unauthorized response with default message", () => {
      ApiResponse.unauthorized(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Não autorizado",
        timestamp: expect.any(String),
      });
    });

    it("should send unauthorized response with custom message", () => {
      const message = "Token de acesso inválido";

      ApiResponse.unauthorized(mockResponse as Response, message);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });
  });

  describe("paginated", () => {
    it("should send paginated response with default message", () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const page = 1;
      const limit = 10;
      const total = 25;

      ApiResponse.paginated(mockResponse as Response, data, page, limit, total);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Recursos recuperados com sucesso",
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
        timestamp: expect.any(String),
      });
    });

    it("should send paginated response with custom message", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const page = 2;
      const limit = 5;
      const total = 12;
      const message = "Usuários recuperados com sucesso";

      ApiResponse.paginated(
        mockResponse as Response,
        data,
        page,
        limit,
        total,
        message
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        pagination: {
          page: 2,
          limit: 5,
          total: 12,
          pages: 3,
        },
        timestamp: expect.any(String),
      });
    });

    it("should calculate pages correctly with different totals", () => {
      const data = [{ id: 1 }];

      // Test with exact division
      ApiResponse.paginated(mockResponse as Response, data, 1, 10, 100);
      let responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.pagination.pages).toBe(10);

      // Test with remainder
      ApiResponse.paginated(mockResponse as Response, data, 1, 10, 95);
      responseCall = (mockResponse.json as jest.Mock).mock.calls[1][0];
      expect(responseCall.pagination.pages).toBe(10);

      // Test with single page
      ApiResponse.paginated(mockResponse as Response, data, 1, 10, 5);
      responseCall = (mockResponse.json as jest.Mock).mock.calls[2][0];
      expect(responseCall.pagination.pages).toBe(1);
    });

    it("should handle empty data array", () => {
      const data: any[] = [];
      const page = 1;
      const limit = 10;
      const total = 0;

      ApiResponse.paginated(mockResponse as Response, data, page, limit, total);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Recursos recuperados com sucesso",
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
        timestamp: expect.any(String),
      });
    });
  });

  describe("integration scenarios", () => {
    it("should work with different data types", () => {
      // Test with array
      const arrayData = [1, 2, 3];
      ApiResponse.success(mockResponse as Response, arrayData);
      expect((mockResponse.json as jest.Mock).mock.calls[0][0].data).toEqual(
        arrayData
      );

      // Test with object
      const objectData = { users: [{ id: 1 }, { id: 2 }] };
      ApiResponse.success(mockResponse as Response, objectData);
      expect((mockResponse.json as jest.Mock).mock.calls[1][0].data).toEqual(
        objectData
      );

      // Test with string
      const stringData = "Success message";
      ApiResponse.success(mockResponse as Response, stringData);
      expect((mockResponse.json as jest.Mock).mock.calls[2][0].data).toEqual(
        stringData
      );
    });

    it("should handle various HTTP status codes", () => {
      const testCases = [
        { code: 200, name: "OK" },
        { code: 201, name: "Created" },
        { code: 400, name: "Bad Request" },
        { code: 401, name: "Unauthorized" },
        { code: 404, name: "Not Found" },
        { code: 500, name: "Internal Server Error" },
      ];

      testCases.forEach(({ code, name }) => {
        ApiResponse.error(mockResponse as Response, `${name} error`, code);
        expect(mockResponse.status).toHaveBeenCalledWith(code);
      });
    });

    it("should maintain response chain", () => {
      const response = mockResponse as Response;

      // Mock the chain behavior
      (response.status as jest.Mock).mockReturnValue(response);
      (response.json as jest.Mock).mockReturnValue(response);

      const result = ApiResponse.success(response, { test: true });

      expect(result).toBe(response);
      expect(response.status).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalled();
    });
  });
});
