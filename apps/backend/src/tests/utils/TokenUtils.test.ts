import { TokenUtils } from "../../utils/TokenUtils";

describe("TokenUtils", () => {
  describe("generateEmailVerificationToken", () => {
    it("should generate a random token", () => {
      const token1 = TokenUtils.generateEmailVerificationToken();
      const token2 = TokenUtils.generateEmailVerificationToken();

      // Token should be a string
      expect(typeof token1).toBe("string");

      // Token should be 64 characters long (32 bytes = 64 hex characters)
      expect(token1.length).toBe(64);

      // Tokens should be different
      expect(token1).not.toBe(token2);

      // Token should contain only hexadecimal characters
      expect(token1).toMatch(/^[0-9a-f]+$/);
      expect(token2).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate unique tokens each time", () => {
      const tokens = new Set();

      // Generate 100 tokens and verify they're all unique
      for (let i = 0; i < 100; i++) {
        const token = TokenUtils.generateEmailVerificationToken();
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }

      expect(tokens.size).toBe(100);
    });
  });

  describe("generateEmailVerificationExpiry", () => {
    it("should generate expiry date 24 hours in the future", () => {
      const beforeGeneration = new Date();
      const expiry = TokenUtils.generateEmailVerificationExpiry();
      const afterGeneration = new Date();

      // Expiry should be a Date object
      expect(expiry).toBeInstanceOf(Date);

      // Expiry should be in the future
      expect(expiry.getTime()).toBeGreaterThan(beforeGeneration.getTime());
      expect(expiry.getTime()).toBeGreaterThan(afterGeneration.getTime());

      // Expiry should be approximately 24 hours from now
      const timeDiff = expiry.getTime() - beforeGeneration.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Allow some tolerance for test execution time
      expect(hoursDiff).toBeGreaterThanOrEqual(23.9);
      expect(hoursDiff).toBeLessThanOrEqual(24.1);
    });

    it("should generate different expiry dates each time", () => {
      const expiry1 = TokenUtils.generateEmailVerificationExpiry();

      // Wait a small amount to ensure different times
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Busy wait
      }

      const expiry2 = TokenUtils.generateEmailVerificationExpiry();

      // Expiry dates should be different
      expect(expiry1.getTime()).not.toBe(expiry2.getTime());
    });

    it("should always be 24 hours from generation time", () => {
      const now = new Date();
      const expiry = TokenUtils.generateEmailVerificationExpiry();

      // Calculate expected expiry time
      const expectedExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Allow 1 second tolerance for test execution
      const timeDiff = Math.abs(expiry.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe("integration", () => {
    it("should work together for email verification flow", () => {
      const token = TokenUtils.generateEmailVerificationToken();
      const expiry = TokenUtils.generateEmailVerificationExpiry();

      // Both should be generated successfully
      expect(token).toBeDefined();
      expect(expiry).toBeDefined();

      // Token should be valid format
      expect(token).toMatch(/^[0-9a-f]{64}$/);

      // Expiry should be in the future
      expect(expiry.getTime()).toBeGreaterThan(Date.now());

      // Expiry should be approximately 24 hours from now
      const timeDiff = expiry.getTime() - Date.now();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      expect(hoursDiff).toBeGreaterThan(23);
      expect(hoursDiff).toBeLessThan(25);
    });
  });
});
