import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../middlewares/errorMiddleware";
import { ApiError } from "../../utils/ApiError";

describe("errorHandler middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: "GET",
      url: "/api/test",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("ApiError handling", () => {
    it("should handle ApiError with status code", () => {
      const apiError = new ApiError("Test error message", 400);

      errorHandler(
        apiError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Test error message",
          stack: expect.any(String),
        },
      });
    });

    it("should handle ApiError with default status code", () => {
      const apiError = new ApiError("Test error message");

      errorHandler(
        apiError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Test error message",
          stack: expect.any(String),
        },
      });
    });
  });

  describe("Generic errors", () => {
    it("should handle generic errors in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const genericError = new Error("Generic error message");

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Generic error message",
          stack: expect.any(String),
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle generic errors in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const genericError = new Error("Generic error message");

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Generic error message",
        },
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
