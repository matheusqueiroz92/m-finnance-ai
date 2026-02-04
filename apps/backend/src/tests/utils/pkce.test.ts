import crypto from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  validateCodeVerifier,
  generateState,
  validateState,
} from "../../utils/pkce";

// Mock crypto module
jest.mock("crypto");

const mockCrypto = crypto as jest.Mocked<typeof crypto>;

describe("PKCE Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateCodeVerifier", () => {
    it("should generate a code verifier using crypto.randomBytes", () => {
      const mockBuffer = Buffer.from("mock-random-bytes-32-chars-long");
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);

      const result = generateCodeVerifier();

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(result).toBe(mockBuffer.toString("base64url"));
    });

    it("should return a string of appropriate length", () => {
      const mockBuffer = Buffer.from("a".repeat(32)); // 32 bytes
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);

      const result = generateCodeVerifier();

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should generate different verifiers on multiple calls", () => {
      const buffer1 = Buffer.from("first-random-bytes-32-chars-long");
      const buffer2 = Buffer.from("second-random-bytes-32-chars-long");

      mockCrypto.randomBytes
        .mockReturnValueOnce(buffer1)
        .mockReturnValueOnce(buffer2);

      const result1 = generateCodeVerifier();
      const result2 = generateCodeVerifier();

      expect(result1).not.toBe(result2);
    });
  });

  describe("generateCodeChallenge", () => {
    it("should generate a code challenge from verifier", () => {
      const verifier = "test-verifier";
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed-result"),
      };
      mockCrypto.createHash.mockReturnValue(mockHash as any);

      const result = generateCodeChallenge(verifier);

      expect(mockCrypto.createHash).toHaveBeenCalledWith("sha256");
      expect(mockHash.update).toHaveBeenCalledWith(verifier);
      expect(mockHash.digest).toHaveBeenCalledWith("base64url");
      expect(result).toBe("hashed-result");
    });

    it("should handle different verifier lengths", () => {
      const shortVerifier = "short";
      const longVerifier = "a".repeat(128);
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed-result"),
      };
      mockCrypto.createHash.mockReturnValue(mockHash as any);

      generateCodeChallenge(shortVerifier);
      generateCodeChallenge(longVerifier);

      expect(mockHash.update).toHaveBeenCalledWith(shortVerifier);
      expect(mockHash.update).toHaveBeenCalledWith(longVerifier);
    });

    it("should return a string result", () => {
      const verifier = "test-verifier";
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed-string"),
      };
      mockCrypto.createHash.mockReturnValue(mockHash as any);

      const result = generateCodeChallenge(verifier);

      expect(typeof result).toBe("string");
      expect(result).toBe("hashed-string");
    });
  });

  describe("validateCodeVerifier", () => {
    it("should return true for valid verifier length (43 chars)", () => {
      const validVerifier = "a".repeat(43);

      const result = validateCodeVerifier(validVerifier);

      expect(result).toBe(true);
    });

    it("should return true for valid verifier length (128 chars)", () => {
      const validVerifier = "a".repeat(128);

      const result = validateCodeVerifier(validVerifier);

      expect(result).toBe(true);
    });

    it("should return true for valid verifier length (middle range)", () => {
      const validVerifier = "a".repeat(85);

      const result = validateCodeVerifier(validVerifier);

      expect(result).toBe(true);
    });

    it("should return false for verifier too short (42 chars)", () => {
      const invalidVerifier = "a".repeat(42);

      const result = validateCodeVerifier(invalidVerifier);

      expect(result).toBe(false);
    });

    it("should return false for verifier too long (129 chars)", () => {
      const invalidVerifier = "a".repeat(129);

      const result = validateCodeVerifier(invalidVerifier);

      expect(result).toBe(false);
    });

    it("should return false for empty verifier", () => {
      const result = validateCodeVerifier("");

      expect(result).toBe(false);
    });

    it("should handle special characters in verifier", () => {
      const specialVerifier =
        "!@#$%^&*()_+-=[]{}|;':\",./<>?`~".repeat(2) + "a"; // 43 chars

      const result = validateCodeVerifier(specialVerifier);

      expect(result).toBe(true);
    });
  });

  describe("generateState", () => {
    it("should generate a state using crypto.randomBytes", () => {
      const mockBuffer = Buffer.from("mock-random-state-bytes");
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);

      const result = generateState();

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(result).toBe(mockBuffer.toString("hex"));
    });

    it("should return a hex string", () => {
      const mockBuffer = Buffer.from("test-state");
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);

      const result = generateState();

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[0-9a-f]+$/); // hex pattern
    });

    it("should generate different states on multiple calls", () => {
      const buffer1 = Buffer.from("first-state");
      const buffer2 = Buffer.from("second-state");

      mockCrypto.randomBytes
        .mockReturnValueOnce(buffer1)
        .mockReturnValueOnce(buffer2);

      const result1 = generateState();
      const result2 = generateState();

      expect(result1).not.toBe(result2);
    });

    it("should generate state of correct length", () => {
      const mockBuffer = Buffer.from("test"); // 4 bytes = 8 hex chars
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);

      const result = generateState();

      expect(result.length).toBe(8); // 4 bytes * 2 hex chars per byte
    });
  });

  describe("validateState", () => {
    it("should return true for identical states", () => {
      const state = "1234567890abcdef";
      mockCrypto.timingSafeEqual.mockReturnValue(true);

      const result = validateState(state, state);

      expect(result).toBe(true);
      expect(mockCrypto.timingSafeEqual).toHaveBeenCalledWith(
        Buffer.from(state, "hex"),
        Buffer.from(state, "hex")
      );
    });

    it("should return false for different states", () => {
      const state1 = "1234567890abcdef";
      const state2 = "fedcba0987654321";
      mockCrypto.timingSafeEqual.mockReturnValue(false);

      const result = validateState(state1, state2);

      expect(result).toBe(false);
      expect(mockCrypto.timingSafeEqual).toHaveBeenCalledWith(
        Buffer.from(state1, "hex"),
        Buffer.from(state2, "hex")
      );
    });

    it("should handle empty states", () => {
      mockCrypto.timingSafeEqual.mockReturnValue(true);

      const result = validateState("", "");

      expect(result).toBe(true);
      expect(mockCrypto.timingSafeEqual).toHaveBeenCalledWith(
        Buffer.from("", "hex"),
        Buffer.from("", "hex")
      );
    });

    it("should handle states of different lengths", () => {
      const shortState = "1234";
      const longState = "1234567890abcdef";
      mockCrypto.timingSafeEqual.mockReturnValue(false);

      const result = validateState(shortState, longState);

      expect(result).toBe(false);
      expect(mockCrypto.timingSafeEqual).toHaveBeenCalledWith(
        Buffer.from(shortState, "hex"),
        Buffer.from(longState, "hex")
      );
    });

    it("should use timingSafeEqual for security", () => {
      const state1 = "1234567890abcdef";
      const state2 = "1234567890abcdef";
      mockCrypto.timingSafeEqual.mockReturnValue(true);

      validateState(state1, state2);

      expect(mockCrypto.timingSafeEqual).toHaveBeenCalled();
    });
  });

  describe("integration tests", () => {
    it("should work together for complete PKCE flow", () => {
      // Mock all crypto functions
      const mockVerifierBuffer = Buffer.from("a".repeat(32)); // 32 bytes to ensure base64url result is >= 43 chars
      const mockStateBuffer = Buffer.from("mock-state-bytes");
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("mock-challenge"),
      };

      mockCrypto.randomBytes
        .mockReturnValueOnce(mockVerifierBuffer)
        .mockReturnValueOnce(mockStateBuffer);
      mockCrypto.createHash.mockReturnValue(mockHash as any);
      mockCrypto.timingSafeEqual.mockReturnValue(true);

      // Generate verifier and challenge
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);
      const state = generateState();

      // Validate
      const isValidVerifier = validateCodeVerifier(verifier);
      const isValidState = validateState(state, state);

      expect(isValidVerifier).toBe(true);
      expect(challenge).toBe("mock-challenge");
      expect(isValidState).toBe(true);
    });

    it("should handle error cases gracefully", () => {
      mockCrypto.randomBytes.mockImplementation(() => {
        throw new Error("Crypto error");
      });

      expect(() => generateCodeVerifier()).toThrow("Crypto error");
      expect(() => generateState()).toThrow("Crypto error");
    });
  });

  describe("edge cases", () => {
    it("should handle null and undefined inputs", () => {
      // These should throw errors because the function doesn't handle null/undefined
      expect(() => validateCodeVerifier(null as any)).toThrow();
      expect(() => validateCodeVerifier(undefined as any)).toThrow();
    });

    it("should handle non-string inputs in validateCodeVerifier", () => {
      expect(validateCodeVerifier(123 as any)).toBe(false);
      expect(validateCodeVerifier({} as any)).toBe(false);
      expect(validateCodeVerifier([] as any)).toBe(false);
    });

    it("should handle special characters in validateState", () => {
      const specialState = "!@#$%^&*()";
      mockCrypto.timingSafeEqual.mockReturnValue(false);

      const result = validateState(specialState, specialState);

      expect(result).toBe(false);
    });
  });
});
