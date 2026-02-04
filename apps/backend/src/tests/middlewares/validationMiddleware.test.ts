import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validationMiddleware";

describe("validationMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("body validation", () => {
    it("should validate request body successfully", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number().min(18),
      });

      mockRequest.body = {
        name: "John Doe",
        email: "john@example.com",
        age: 25,
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should reject invalid request body", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number().min(18),
      });

      mockRequest.body = {
        name: "John Doe",
        email: "invalid-email",
        age: 15,
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Erro de validação",
          statusCode: 400,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("complex validation", () => {
    it("should handle nested object validation", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        preferences: z.object({
          theme: z.enum(["light", "dark"]),
          notifications: z.boolean(),
        }),
      });

      mockRequest.body = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
        preferences: {
          theme: "dark",
          notifications: true,
        },
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should handle array validation", () => {
      const schema = z.object({
        items: z.array(
          z.object({
            id: z.string(),
            quantity: z.number().min(1),
          })
        ),
      });

      mockRequest.body = {
        items: [
          { id: "1", quantity: 2 },
          { id: "2", quantity: 1 },
        ],
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle missing required fields", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number(),
      });

      mockRequest.body = {
        name: "John Doe",
        // Missing email and age
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Erro de validação",
          statusCode: 400,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should handle type mismatches", () => {
      const schema = z.object({
        age: z.number(),
        isActive: z.boolean(),
      });

      mockRequest.body = {
        age: "not-a-number",
        isActive: "not-a-boolean",
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Erro de validação",
          statusCode: 400,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
