import mongoose, { ClientSession } from "mongoose";
import { TransactionManager } from "../../utils/TransactionManager";

// Mock mongoose
jest.mock("mongoose");

const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe("TransactionManager", () => {
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  } as unknown as ClientSession;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.MONGODB_URL;

    // Reset all mock implementations
    mockSession.startTransaction.mockClear();
    mockSession.commitTransaction.mockClear();
    mockSession.abortTransaction.mockClear();
    mockSession.endSession.mockClear();
    mockMongoose.startSession.mockClear();

    // Set default mock implementations
    mockMongoose.startSession.mockResolvedValue(mockSession);
    mockSession.startTransaction.mockResolvedValue(undefined);
    mockSession.commitTransaction.mockResolvedValue(undefined);
    mockSession.abortTransaction.mockResolvedValue(undefined);
    mockSession.endSession.mockResolvedValue(undefined);
  });

  describe("executeInTransaction", () => {
    it("should execute callback without transaction in test environment", async () => {
      process.env.NODE_ENV = "test";

      const mockCallback = jest.fn().mockResolvedValue("test-result");

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("test-result");
      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(mockMongoose.startSession).not.toHaveBeenCalled();
      expect(mockSession.startTransaction).not.toHaveBeenCalled();
    });

    it("should execute callback without transaction with localhost MongoDB", async () => {
      process.env.MONGODB_URL = "mongodb://localhost:27017/test";

      const mockCallback = jest.fn().mockResolvedValue("localhost-result");

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("localhost-result");
      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(mockMongoose.startSession).not.toHaveBeenCalled();
      expect(mockSession.startTransaction).not.toHaveBeenCalled();
    });

    it("should execute callback with transaction in production environment", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const mockCallback = jest.fn().mockResolvedValue("production-result");

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("production-result");
      expect(mockCallback).toHaveBeenCalledWith(mockSession);
      expect(mockMongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should handle callback errors and abort transaction", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const testError = new Error("Callback failed");
      const mockCallback = jest.fn().mockRejectedValue(testError);

      await expect(
        TransactionManager.executeInTransaction(mockCallback)
      ).rejects.toThrow("Callback failed");

      expect(mockCallback).toHaveBeenCalledWith(mockSession);
      expect(mockMongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });

    it("should handle session start errors", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const sessionError = new Error("Session start failed");
      mockMongoose.startSession.mockRejectedValue(sessionError);

      const mockCallback = jest.fn().mockResolvedValue("result");

      await expect(
        TransactionManager.executeInTransaction(mockCallback)
      ).rejects.toThrow("Session start failed");

      expect(mockMongoose.startSession).toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
      expect(mockSession.startTransaction).not.toHaveBeenCalled();
    });

    it("should handle commit transaction errors", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const commitError = new Error("Commit failed");
      mockSession.commitTransaction.mockRejectedValue(commitError);

      const mockCallback = jest.fn().mockResolvedValue("result");

      await expect(
        TransactionManager.executeInTransaction(mockCallback)
      ).rejects.toThrow("Commit failed");

      expect(mockCallback).toHaveBeenCalledWith(mockSession);
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should handle abort transaction errors", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const abortError = new Error("Abort failed");
      mockSession.abortTransaction.mockRejectedValue(abortError);

      const testError = new Error("Callback failed");
      const mockCallback = jest.fn().mockRejectedValue(testError);

      // The TransactionManager will throw the abort error because it's not caught
      await expect(
        TransactionManager.executeInTransaction(mockCallback)
      ).rejects.toThrow("Abort failed");

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should work with different callback return types", async () => {
      // Test in test environment to avoid transaction complexity
      process.env.NODE_ENV = "test";
      delete process.env.MONGODB_URL;

      // Test with string
      const stringCallback = jest.fn().mockResolvedValue("string-result");
      const stringResult =
        await TransactionManager.executeInTransaction(stringCallback);
      expect(stringResult).toBe("string-result");
      expect(stringCallback).toHaveBeenCalledWith(null);

      // Test with number
      const numberCallback = jest.fn().mockResolvedValue(42);
      const numberResult =
        await TransactionManager.executeInTransaction(numberCallback);
      expect(numberResult).toBe(42);
      expect(numberCallback).toHaveBeenCalledWith(null);

      // Test with object
      const objectCallback = jest
        .fn()
        .mockResolvedValue({ id: 1, name: "test" });
      const objectResult =
        await TransactionManager.executeInTransaction(objectCallback);
      expect(objectResult).toEqual({ id: 1, name: "test" });
      expect(objectCallback).toHaveBeenCalledWith(null);

      // Test with array
      const arrayCallback = jest.fn().mockResolvedValue([1, 2, 3]);
      const arrayResult =
        await TransactionManager.executeInTransaction(arrayCallback);
      expect(arrayResult).toEqual([1, 2, 3]);
      expect(arrayCallback).toHaveBeenCalledWith(null);

      // Test with null
      const nullCallback = jest.fn().mockResolvedValue(null);
      const nullResult =
        await TransactionManager.executeInTransaction(nullCallback);
      expect(nullResult).toBeNull();
      expect(nullCallback).toHaveBeenCalledWith(null);

      // Test with undefined
      const undefinedCallback = jest.fn().mockResolvedValue(undefined);
      const undefinedResult =
        await TransactionManager.executeInTransaction(undefinedCallback);
      expect(undefinedResult).toBeUndefined();
    });

    it("should handle multiple concurrent transactions", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const mockCallback1 = jest.fn().mockResolvedValue("result1");
      const mockCallback2 = jest.fn().mockResolvedValue("result2");
      const mockCallback3 = jest.fn().mockResolvedValue("result3");

      const [result1, result2, result3] = await Promise.all([
        TransactionManager.executeInTransaction(mockCallback1),
        TransactionManager.executeInTransaction(mockCallback2),
        TransactionManager.executeInTransaction(mockCallback3),
      ]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(result3).toBe("result3");

      expect(mockMongoose.startSession).toHaveBeenCalledTimes(3);
    });
  });

  describe("edge cases", () => {
    it("should handle undefined NODE_ENV", async () => {
      delete process.env.NODE_ENV;
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const mockCallback = jest.fn().mockResolvedValue("result");

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("result");
      expect(mockCallback).toHaveBeenCalledWith(mockSession);
      expect(mockMongoose.startSession).toHaveBeenCalled();
    });

    it("should handle undefined MONGODB_URL", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.MONGODB_URL;

      const mockCallback = jest.fn().mockResolvedValue("result");

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("result");
      expect(mockCallback).toHaveBeenCalledWith(mockSession);
      expect(mockMongoose.startSession).toHaveBeenCalled();
    });

    it("should handle empty MONGODB_URL", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "";

      const mockCallback = jest.fn().mockResolvedValue("result");

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("result");
      expect(mockCallback).toHaveBeenCalledWith(mockSession);
      expect(mockMongoose.startSession).toHaveBeenCalled();
    });

    it("should handle MONGODB_URL with localhost in different formats", async () => {
      const localhostUrls = [
        "mongodb://localhost:27017/test",
        "mongodb://localhost/test",
        "mongodb://localhost/",
        "mongodb://localhost",
      ];

      for (const url of localhostUrls) {
        // Clear mocks and reset environment for each iteration
        jest.clearAllMocks();
        mockMongoose.startSession.mockResolvedValue(mockSession);

        process.env.NODE_ENV = "production"; // Ensure not test environment
        process.env.MONGODB_URL = url;
        const mockCallback = jest.fn().mockResolvedValue("result");

        const result =
          await TransactionManager.executeInTransaction(mockCallback);

        expect(result).toBe("result");
        expect(mockCallback).toHaveBeenCalledWith(null);
        expect(mockMongoose.startSession).not.toHaveBeenCalled();
      }
    });

    it("should handle callback that takes time to complete", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const mockCallback = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return "delayed-result";
      });

      const result =
        await TransactionManager.executeInTransaction(mockCallback);

      expect(result).toBe("delayed-result");
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should handle callback that throws synchronously", async () => {
      process.env.NODE_ENV = "production";
      process.env.MONGODB_URL = "mongodb://production-cluster:27017/test";

      const syncError = new Error("Synchronous error");
      const mockCallback = jest.fn().mockImplementation(() => {
        throw syncError;
      });

      await expect(
        TransactionManager.executeInTransaction(mockCallback)
      ).rejects.toThrow("Synchronous error");

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
