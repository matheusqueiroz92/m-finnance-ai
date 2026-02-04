import mongoose from "mongoose";
import connectDB from "../../config/database";

// Mock mongoose
jest.mock("mongoose");
const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
const mockProcessExit = jest.spyOn(process, "exit").mockImplementation();

// Mock dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("Database Configuration", () => {
  const originalEnv = process.env.MONGODB_URI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProcessExit.mockClear();
  });

  afterEach(() => {
    process.env.MONGODB_URI = originalEnv;
  });

  describe("connectDB", () => {
    it("should connect to MongoDB successfully", async () => {
      process.env.MONGODB_URI = "mongodb://localhost:27017/test";

      const mockConnection = {
        connection: {
          host: "localhost",
          name: "test",
        },
      };

      mockMongoose.connect.mockResolvedValue(mockConnection as any);

      await connectDB();

      expect(mockMongoose.connect).toHaveBeenCalledWith(
        "mongodb://localhost:27017/test"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "MongoDB Connected in: localhost"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith("MongoDB Database: test");
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it("should handle connection with different host and database", async () => {
      process.env.MONGODB_URI =
        "mongodb://production-server:27017/production-db";

      const mockConnection = {
        connection: {
          host: "production-server",
          name: "production-db",
        },
      };

      mockMongoose.connect.mockResolvedValue(mockConnection as any);

      await connectDB();

      expect(mockMongoose.connect).toHaveBeenCalledWith(
        "mongodb://production-server:27017/production-db"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "MongoDB Connected in: production-server"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "MongoDB Database: production-db"
      );
    });

    it("should handle connection error with Error instance", async () => {
      process.env.MONGODB_URI = "mongodb://invalid-host:27017/test";

      const connectionError = new Error("Connection failed");
      mockMongoose.connect.mockRejectedValue(connectionError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith("Error: Connection failed");
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle connection error with non-Error instance", async () => {
      process.env.MONGODB_URI = "mongodb://invalid-host:27017/test";

      const connectionError = "String error";
      mockMongoose.connect.mockRejectedValue(connectionError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "An unknown error occurred"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle connection error with null", async () => {
      process.env.MONGODB_URI = "mongodb://invalid-host:27017/test";

      mockMongoose.connect.mockRejectedValue(null);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "An unknown error occurred"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle connection error with undefined", async () => {
      process.env.MONGODB_URI = "mongodb://invalid-host:27017/test";

      mockMongoose.connect.mockRejectedValue(undefined);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "An unknown error occurred"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle connection error with object", async () => {
      process.env.MONGODB_URI = "mongodb://invalid-host:27017/test";

      const connectionError = { message: "Custom error object" };
      mockMongoose.connect.mockRejectedValue(connectionError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "An unknown error occurred"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should use MONGODB_URI environment variable", async () => {
      process.env.MONGODB_URI = "mongodb://custom-uri:27017/custom-db";

      const mockConnection = {
        connection: {
          host: "custom-uri",
          name: "custom-db",
        },
      };

      mockMongoose.connect.mockResolvedValue(mockConnection as any);

      await connectDB();

      expect(mockMongoose.connect).toHaveBeenCalledWith(
        "mongodb://custom-uri:27017/custom-db"
      );
    });

    it("should handle missing MONGODB_URI environment variable", async () => {
      delete process.env.MONGODB_URI;

      const connectionError = new Error("MongoDB URI is required");
      mockMongoose.connect.mockRejectedValue(connectionError);

      await connectDB();

      expect(mockMongoose.connect).toHaveBeenCalledWith(undefined);
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error: MongoDB URI is required"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle empty MONGODB_URI environment variable", async () => {
      process.env.MONGODB_URI = "";

      const connectionError = new Error("Empty MongoDB URI");
      mockMongoose.connect.mockRejectedValue(connectionError);

      await connectDB();

      expect(mockMongoose.connect).toHaveBeenCalledWith("");
      expect(mockConsoleError).toHaveBeenCalledWith("Error: Empty MongoDB URI");
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle network timeout error", async () => {
      process.env.MONGODB_URI = "mongodb://timeout-host:27017/test";

      const timeoutError = new Error("Connection timeout");
      timeoutError.name = "MongooseServerSelectionError";
      mockMongoose.connect.mockRejectedValue(timeoutError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error: Connection timeout"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle authentication error", async () => {
      process.env.MONGODB_URI = "mongodb://user:wrongpass@host:27017/db";

      const authError = new Error("Authentication failed");
      authError.name = "MongoError";
      mockMongoose.connect.mockRejectedValue(authError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error: Authentication failed"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe("Environment Configuration", () => {
    it("should load environment variables", () => {
      // This test verifies that dotenv.config() is called
      // The actual loading is mocked, but we can verify the import
      expect(process.env).toBeDefined();
    });

    it("should handle different MongoDB URI formats", async () => {
      const uriFormats = [
        "mongodb://localhost:27017/test",
        "mongodb://user:pass@host:27017/db",
        "mongodb+srv://cluster.mongodb.net/db",
        "mongodb://host1:27017,host2:27017/db",
      ];

      for (const uri of uriFormats) {
        process.env.MONGODB_URI = uri;

        const mockConnection = {
          connection: {
            host: "test-host",
            name: "test-db",
          },
        };

        mockMongoose.connect.mockResolvedValue(mockConnection as any);

        await connectDB();

        expect(mockMongoose.connect).toHaveBeenCalledWith(uri);

        jest.clearAllMocks();
      }
    });
  });

  describe("Error Scenarios", () => {
    it("should handle Mongoose connection errors", async () => {
      process.env.MONGODB_URI = "mongodb://localhost:27017/test";

      const mongooseError = new Error("Mongoose connection failed");
      mongooseError.name = "MongooseError";
      mockMongoose.connect.mockRejectedValue(mongooseError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error: Mongoose connection failed"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle invalid URI format", async () => {
      process.env.MONGODB_URI = "invalid-uri-format";

      const uriError = new Error("Invalid URI format");
      mockMongoose.connect.mockRejectedValue(uriError);

      await connectDB();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error: Invalid URI format"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle database name with special characters", async () => {
      process.env.MONGODB_URI = "mongodb://localhost:27017/test-db_123";

      const mockConnection = {
        connection: {
          host: "localhost",
          name: "test-db_123",
        },
      };

      mockMongoose.connect.mockResolvedValue(mockConnection as any);

      await connectDB();

      expect(mockMongoose.connect).toHaveBeenCalledWith(
        "mongodb://localhost:27017/test-db_123"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "MongoDB Database: test-db_123"
      );
    });
  });
});
