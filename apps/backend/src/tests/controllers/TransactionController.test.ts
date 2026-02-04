import { Request, Response } from "express";
import { TransactionController } from "../../controllers/TransactionController";
import { TransactionService } from "../../services/TransactionService";

// Mock do TransactionService
jest.mock("../../services/TransactionService");
const MockedTransactionService = TransactionService as jest.MockedClass<
  typeof TransactionService
>;

describe("TransactionController", () => {
  let transactionController: TransactionController;
  let mockTransactionService: jest.Mocked<TransactionService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock service
    mockTransactionService = {
      createTransaction: jest.fn(),
      getUserTransactions: jest.fn(),
      getTransactionById: jest.fn(),
      updateTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      getTransactionStats: jest.fn(),
      getTransactionsByCategory: jest.fn(),
    } as any;

    // Mock the service constructor
    MockedTransactionService.mockImplementation(() => mockTransactionService);

    // Create controller instance with injected service
    transactionController = new TransactionController(mockTransactionService);

    // Setup mock request/response
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: "test-user-id" },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("createTransaction", () => {
    it("should create a transaction successfully", async () => {
      const transactionData = {
        amount: 500,
        description: "Test Transaction",
        type: "expense",
        date: new Date(),
        account: "account-id",
        category: "category-id",
      };
      const mockTransaction = {
        _id: "transaction-id",
        amount: 500,
        description: "Test Transaction",
        type: "expense",
        date: new Date(),
        user: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userId = "test-user-id";

      mockRequest.body = transactionData;
      mockRequest.user = { _id: userId };
      mockTransactionService.createTransaction.mockResolvedValue(
        mockTransaction as any
      );

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          account: transactionData.account,
          category: transactionData.category,
          amount: transactionData.amount,
          type: transactionData.type,
          description: transactionData.description,
          date: transactionData.date,
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Transação criada com sucesso",
          data: mockTransaction as any,
        })
      );
    });

    it("should handle create transaction errors", async () => {
      const transactionData = {
        amount: 500,
        description: "Test Transaction",
        type: "expense",
        date: new Date(),
        account: "account-id",
        category: "category-id",
      };
      const userId = "test-user-id";
      const error = new Error("Transaction creation failed");

      mockRequest.body = transactionData;
      mockRequest.user = { _id: userId };
      mockTransactionService.createTransaction.mockRejectedValue(error);

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getTransactions", () => {
    it("should get user transactions successfully", async () => {
      const mockTransactions = [
        {
          _id: "transaction-id",
          amount: 500,
          description: "Test Transaction",
          type: "expense",
          date: new Date(),
          user: "test-user-id",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockPagination = {
        transactions: mockTransactions,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockRequest.query = { page: "1", limit: "10" };
      mockTransactionService.getUserTransactions.mockResolvedValue(
        mockPagination as any
      );

      await transactionController.getUserTransactions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTransactionService.getUserTransactions).toHaveBeenCalledWith(
        userId,
        {
          page: 1,
          limit: 10,
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });

    it("should handle get transactions errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to get transactions");

      mockRequest.user = { _id: userId };
      mockTransactionService.getUserTransactions.mockRejectedValue(error);

      await transactionController.getUserTransactions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getTransactionById", () => {
    it("should get transaction by id successfully", async () => {
      const transactionId = "transaction-id";
      const mockTransaction = {
        _id: "transaction-id",
        amount: 500,
        description: "Test Transaction",
        type: "expense",
        date: new Date(),
        user: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userId = "test-user-id";

      mockRequest.params = { id: transactionId };
      mockRequest.user = { _id: userId };
      mockTransactionService.getTransactionById.mockResolvedValue(
        mockTransaction as any
      );

      await transactionController.getTransactionById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTransactionService.getTransactionById).toHaveBeenCalledWith(
        transactionId,
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTransaction as any,
        })
      );
    });

    it("should handle get transaction by id errors", async () => {
      const transactionId = "transaction-id";
      const userId = "test-user-id";
      const error = new Error("Transaction not found");

      mockRequest.params = { id: transactionId };
      mockRequest.user = { _id: userId };
      mockTransactionService.getTransactionById.mockRejectedValue(error);

      await transactionController.getTransactionById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction successfully", async () => {
      const transactionId = "transaction-id";
      const updateData = { amount: 200, description: "Updated transaction" };
      const mockTransaction = {
        _id: "transaction-id",
        amount: 500,
        description: "Test Transaction",
        type: "expense",
        date: new Date(),
        user: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userId = "test-user-id";

      mockRequest.params = { id: transactionId };
      mockRequest.body = updateData;
      mockRequest.user = { _id: userId };
      mockTransactionService.updateTransaction.mockResolvedValue(
        mockTransaction as any
      );

      await transactionController.updateTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTransactionService.updateTransaction).toHaveBeenCalledWith(
        transactionId,
        userId,
        updateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Transação atualizada com sucesso",
          data: mockTransaction as any,
        })
      );
    });

    it("should handle update transaction errors", async () => {
      const transactionId = "transaction-id";
      const updateData = { amount: 200 };
      const userId = "test-user-id";
      const error = new Error("Update failed");

      mockRequest.params = { id: transactionId };
      mockRequest.body = updateData;
      mockRequest.user = { _id: userId };
      mockTransactionService.updateTransaction.mockRejectedValue(error);

      await transactionController.updateTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteTransaction", () => {
    it("should delete transaction successfully", async () => {
      const transactionId = "transaction-id";
      const userId = "test-user-id";

      mockRequest.params = { id: transactionId };
      mockRequest.user = { _id: userId };
      mockTransactionService.deleteTransaction.mockResolvedValue(
        undefined as any
      );

      await transactionController.deleteTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith(
        transactionId,
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Transação excluída com sucesso",
        })
      );
    });

    it("should handle delete transaction errors", async () => {
      const transactionId = "transaction-id";
      const userId = "test-user-id";
      const error = new Error("Delete failed");

      mockRequest.params = { id: transactionId };
      mockRequest.user = { _id: userId };
      mockTransactionService.deleteTransaction.mockRejectedValue(error);

      await transactionController.deleteTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getTransactionStats", () => {
    it("should get transaction stats successfully", async () => {
      const mockStats = {
        totalIncome: 5000,
        totalExpenses: 3000,
        balance: 2000,
        transactionCount: 10,
        averageTransaction: 500,
        monthlyData: {},
        categoryBreakdown: [],
      };
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockTransactionService.getTransactionStats.mockResolvedValue(
        mockStats as any
      );

      await transactionController.getTransactionStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTransactionService.getTransactionStats).toHaveBeenCalledWith(
        userId,
        "month"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockStats as any,
        })
      );
    });

    it("should handle get transaction stats errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Stats calculation failed");

      mockRequest.user = { _id: userId };
      mockTransactionService.getTransactionStats.mockRejectedValue(error);

      await transactionController.getTransactionStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
