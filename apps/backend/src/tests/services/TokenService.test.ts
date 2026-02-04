import { TestDataFactory } from "../utils/testHelpers";
import { TokenService } from "../../services/TokenService";
import { IUserDTO } from "../../interfaces/entities/IUser";
import { IUser } from "../../interfaces/entities/IUser";

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

describe("TokenService", () => {
  let tokenService: TokenService;
  let testUser: any;
  let jwt: any;

  beforeEach(async () => {
    tokenService = new TokenService();
    testUser = await TestDataFactory.createUser();

    // Get mocked jwt
    jwt = require("jsonwebtoken");
  });

  describe("generateTokenPair", () => {
    it("should generate access and refresh tokens", () => {
      const mockAccessToken = "mock_access_token";
      const mockRefreshToken = "mock_refresh_token";

      jwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = tokenService.generateTokenPair(testUser);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
    });

    it("should call jwt.sign with correct parameters for access token", () => {
      const mockAccessToken = "mock_access_token";
      jwt.sign.mockReturnValue(mockAccessToken);

      tokenService.generateAccessToken(testUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: testUser._id.toString(),
          email: testUser.email,
          type: "access",
        },
        expect.any(String),
        {
          expiresIn: "15m",
          issuer: "m-finnance-ai",
          audience: "m-finnance-ai-client",
        }
      );
    });

    it("should call jwt.sign with correct parameters for refresh token", () => {
      const mockRefreshToken = "mock_refresh_token";
      jwt.sign.mockReturnValue(mockRefreshToken);

      tokenService.generateRefreshToken(testUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: testUser._id.toString(),
          email: testUser.email,
          type: "refresh",
        },
        expect.any(String),
        {
          expiresIn: "7d",
          issuer: "m-finnance-ai",
          audience: "m-finnance-ai-client",
        }
      );
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify valid access token", () => {
      const mockPayload = {
        userId: testUser._id.toString(),
        email: testUser.email,
        type: "access",
      };

      jwt.verify.mockReturnValue(mockPayload);

      const result = tokenService.verifyAccessToken("valid_token");

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(
        "valid_token",
        expect.any(String)
      );
    });

    it("should return null for invalid token", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = tokenService.verifyAccessToken("invalid_token");

      expect(result).toBeNull();
    });

    it("should return null for wrong token type", () => {
      const mockPayload = {
        userId: testUser._id.toString(),
        email: testUser.email,
        type: "refresh", // Wrong type
      };

      jwt.verify.mockReturnValue(mockPayload);

      const result = tokenService.verifyAccessToken("refresh_token");

      expect(result).toBeNull();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify valid refresh token", () => {
      const mockPayload = {
        userId: testUser._id.toString(),
        email: testUser.email,
        type: "refresh",
      };

      jwt.verify.mockReturnValue(mockPayload);

      const result = tokenService.verifyRefreshToken("valid_refresh_token");

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(
        "valid_refresh_token",
        expect.any(String)
      );
    });

    it("should return null for invalid refresh token", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = tokenService.verifyRefreshToken("invalid_token");

      expect(result).toBeNull();
    });

    it("should return null for wrong token type", () => {
      const mockPayload = {
        userId: testUser._id.toString(),
        email: testUser.email,
        type: "access", // Wrong type
      };

      jwt.verify.mockReturnValue(mockPayload);

      const result = tokenService.verifyRefreshToken("access_token");

      expect(result).toBeNull();
    });
  });

  describe("generateTokenPair with different user types", () => {
    it("should work with IUser interface", () => {
      const userWithIUser = {
        _id: testUser._id,
        email: testUser.email,
        name: testUser.name,
        // Other IUser properties...
      };

      const mockAccessToken = "mock_access_token";
      const mockRefreshToken = "mock_refresh_token";

      jwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = tokenService.generateTokenPair(
        userWithIUser as IUser | IUserDTO
      );

      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
    });

    it("should work with IUserDTO interface", () => {
      const userWithIUserDTO = {
        _id: testUser._id,
        email: testUser.email,
        name: testUser.name,
        // Other IUserDTO properties...
      };

      const mockAccessToken = "mock_access_token";
      const mockRefreshToken = "mock_refresh_token";

      jwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = tokenService.generateTokenPair(
        userWithIUserDTO as IUser | IUserDTO
      );

      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
    });
  });
});
