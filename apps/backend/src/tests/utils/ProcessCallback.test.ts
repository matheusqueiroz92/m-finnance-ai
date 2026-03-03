import { processCallback } from "../../utils/ProcessCallback";
import { container } from "../../config/container";
import { TokenService } from "../../services/TokenService";
import { CookieManager } from "../../middlewares/cookieMiddleware";

// Mock dependencies
jest.mock("../../config/container");
jest.mock("../../services/TokenService");
jest.mock("../../middlewares/cookieMiddleware");

const mockContainer = container as jest.Mocked<typeof container>;
const mockTokenService = {} as jest.Mocked<TokenService>;
const mockCookieManager = CookieManager as jest.Mocked<typeof CookieManager>;

describe("ProcessCallback", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment variables
    process.env.FRONTEND_URL = "http://localhost:3000";

    // Setup mocks
    mockContainer.resolve.mockReturnValue(mockTokenService);
    mockTokenService.generateTokenPair = jest.fn().mockReturnValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    mockCookieManager.setAccessToken = jest.fn();
    mockCookieManager.setRefreshToken = jest.fn();
    mockCookieManager.setToken = jest.fn();

    // Setup request and response mocks
    mockRequest = {};
    mockResponse = {
      redirect: jest.fn(),
    };
  });

  describe("successful callback", () => {
    it("should process callback with valid user", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
        name: "Test User",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      processCallback(mockRequest, mockResponse);

      expect(mockContainer.resolve).toHaveBeenCalledWith("TokenService");
      expect(mockTokenService.generateTokenPair).toHaveBeenCalledWith(mockUser);
      expect(mockCookieManager.setAccessToken).toHaveBeenCalledWith(
        mockResponse,
        "access-token"
      );
      expect(mockCookieManager.setRefreshToken).toHaveBeenCalledWith(
        mockResponse,
        "refresh-token"
      );
      expect(mockCookieManager.setToken).toHaveBeenCalledWith(
        mockResponse,
        "access-token"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/auth/success"
      );
    });

    it("should handle callback with minimal user data", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      processCallback(mockRequest, mockResponse);

      expect(mockTokenService.generateTokenPair).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/auth/success"
      );
    });
  });

  describe("error handling", () => {
    it("should redirect when req.user is null", () => {
      mockRequest.user = null;

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=user_not_found"
      );
      expect(mockContainer.resolve).not.toHaveBeenCalled();
      expect(mockTokenService.generateTokenPair).not.toHaveBeenCalled();
    });

    it("should redirect when req.user is undefined", () => {
      mockRequest.user = undefined;

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=user_not_found"
      );
      expect(mockContainer.resolve).not.toHaveBeenCalled();
      expect(mockTokenService.generateTokenPair).not.toHaveBeenCalled();
    });

    it("should redirect when authResult.user is missing", () => {
      mockRequest.user = {
        token: "auth-token",
        // Missing user property
      };

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=user_not_found"
      );
      expect(mockContainer.resolve).not.toHaveBeenCalled();
      expect(mockTokenService.generateTokenPair).not.toHaveBeenCalled();
    });

    it("should redirect when authResult is null", () => {
      mockRequest.user = null;

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=user_not_found"
      );
    });

    it("should handle token service errors", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      // Mock token service error
      mockTokenService.generateTokenPair.mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=callback_failed"
      );
      expect(mockCookieManager.setAccessToken).not.toHaveBeenCalled();
      expect(mockCookieManager.setRefreshToken).not.toHaveBeenCalled();
      expect(mockCookieManager.setToken).not.toHaveBeenCalled();
    });

    it("should handle cookie manager errors", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      // Mock cookie manager error
      mockCookieManager.setAccessToken.mockImplementation(() => {
        throw new Error("Cookie setting failed");
      });

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=callback_failed"
      );
    });

    it("should handle container resolve errors", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      // Mock container resolve error
      mockContainer.resolve.mockImplementation(() => {
        throw new Error("Container resolve failed");
      });

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=callback_failed"
      );
    });
  });

  describe("environment configuration", () => {
    it("should use custom FRONTEND_URL", () => {
      process.env.FRONTEND_URL = "https://myapp.com";

      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "https://myapp.com/auth/success"
      );
    });

    it("should handle missing FRONTEND_URL", () => {
      delete process.env.FRONTEND_URL;

      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "undefined/auth/success"
      );
    });
  });

  describe("token generation", () => {
    it("should generate tokens with correct user data", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      processCallback(mockRequest, mockResponse);

      expect(mockTokenService.generateTokenPair).toHaveBeenCalledWith(mockUser);
    });

    it("should handle different token formats", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      // Mock different token format
      mockTokenService.generateTokenPair.mockReturnValue({
        accessToken: "jwt.access.token",
        refreshToken: "jwt.refresh.token",
      });

      processCallback(mockRequest, mockResponse);

      expect(mockCookieManager.setAccessToken).toHaveBeenCalledWith(
        mockResponse,
        "jwt.access.token"
      );
      expect(mockCookieManager.setRefreshToken).toHaveBeenCalledWith(
        mockResponse,
        "jwt.refresh.token"
      );
      expect(mockCookieManager.setToken).toHaveBeenCalledWith(
        mockResponse,
        "jwt.access.token"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/auth/success"
      );
    });
  });

  describe("cookie management", () => {
    it("should set both access and refresh tokens", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      processCallback(mockRequest, mockResponse);

      expect(mockCookieManager.setAccessToken).toHaveBeenCalledTimes(1);
      expect(mockCookieManager.setRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCookieManager.setToken).toHaveBeenCalledTimes(1);
      expect(mockCookieManager.setAccessToken).toHaveBeenCalledWith(
        mockResponse,
        "access-token"
      );
      expect(mockCookieManager.setRefreshToken).toHaveBeenCalledWith(
        mockResponse,
        "refresh-token"
      );
      expect(mockCookieManager.setToken).toHaveBeenCalledWith(
        mockResponse,
        "access-token"
      );
    });

    it("should handle cookie setting failures gracefully", () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
      };

      mockRequest.user = {
        user: mockUser,
        token: "auth-token",
      };

      // Mock cookie setting failure
      mockCookieManager.setRefreshToken.mockImplementation(() => {
        throw new Error("Cookie setting failed");
      });

      processCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/login?error=callback_failed"
      );
    });
  });
});
