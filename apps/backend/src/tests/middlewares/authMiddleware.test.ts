import { Request, Response, NextFunction } from "express";
import { protect } from "../../middlewares/authMiddleware";

// Mock do UserModel
jest.mock("../../schemas/UserSchema");
const { UserModel } = require("../../schemas/UserSchema");

// Mock do jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("protect middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      headers: {},
      user: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("missing token", () => {
    it("should reject request without authorization header", async () => {
      await protect(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not authorized, no token",
          statusCode: 401,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should reject request with empty authorization header", async () => {
      mockRequest.headers = {
        authorization: "",
      };

      await protect(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not authorized, no token",
          statusCode: 401,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("token format", () => {
    it("should reject request without Bearer prefix", async () => {
      mockRequest.headers = {
        authorization: "just-token",
      };

      await protect(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Not authorized, no token",
          statusCode: 401,
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
