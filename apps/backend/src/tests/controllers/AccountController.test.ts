import { Request, Response } from "express";
import { AccountController } from "../../controllers/AccountController";
import { AccountService } from "../../services/AccountService";

// Mock do AccountService
jest.mock("../../services/AccountService");
const MockedAccountService = AccountService as jest.MockedClass<
  typeof AccountService
>;

describe("AccountController", () => {
  let accountController: AccountController;
  let mockAccountService: jest.Mocked<AccountService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock service
    mockAccountService = {
      createAccount: jest.fn(),
      getAccountsByUserId: jest.fn(),
      getUserAccounts: jest.fn(),
      getAccountById: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
    } as any;

    // Mock the service constructor
    MockedAccountService.mockImplementation(() => mockAccountService);

    // Create controller instance with injected service
    accountController = new AccountController(mockAccountService);

    // Setup mock request/response
    mockRequest = {
      body: {},
      params: {},
      user: { id: "test-user-id" },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("createAccount", () => {
    it("should create an account successfully", async () => {
      const accountData = {
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
      };
      const mockAccount = {
        _id: "account-id",
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
        user: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userId = "test-user-id";

      mockRequest.body = accountData;
      mockRequest.user = { _id: userId };
      mockAccountService.createAccount.mockResolvedValue(mockAccount as any);

      await accountController.createAccount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAccountService.createAccount).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          name: accountData.name,
          type: accountData.type,
          balance: accountData.balance,
          institution: accountData.institution,
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Conta criada com sucesso",
          data: mockAccount,
        })
      );
    });

    it("should handle create account errors", async () => {
      const accountData = {
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
      };
      const userId = "test-user-id";
      const error = new Error("Account creation failed");

      mockRequest.body = accountData;
      mockRequest.user = { _id: userId };
      mockAccountService.createAccount.mockRejectedValue(error);

      await accountController.createAccount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAccounts", () => {
    it("should get user accounts successfully", async () => {
      const mockAccounts = [
        {
          _id: "account-id",
          name: "Test Account",
          type: "checking",
          balance: 1000,
          institution: "Test Bank",
          user: "test-user-id",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const userId = "test-user-id";

      mockRequest.user = { _id: userId };
      mockAccountService.getAccountsByUserId.mockResolvedValue(
        mockAccounts as any
      );

      await accountController.getAccounts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAccountService.getAccountsByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAccounts,
        })
      );
    });

    it("should handle get accounts errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Failed to get accounts");

      mockRequest.user = { _id: userId };
      mockAccountService.getAccountsByUserId.mockRejectedValue(error);

      await accountController.getAccounts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAccountById", () => {
    it("should get account by id successfully", async () => {
      const accountId = "account-id";
      const mockAccount = {
        _id: "account-id",
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
        user: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userId = "test-user-id";

      mockRequest.params = { id: accountId };
      mockRequest.user = { _id: userId };
      mockAccountService.getAccountById.mockResolvedValue(mockAccount as any);

      await accountController.getAccountById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAccountService.getAccountById).toHaveBeenCalledWith(
        accountId,
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAccount,
        })
      );
    });

    it("should handle get account by id errors", async () => {
      const accountId = "account-id";
      const userId = "test-user-id";
      const error = new Error("Account not found");

      mockRequest.params = { id: accountId };
      mockRequest.user = { _id: userId };
      mockAccountService.getAccountById.mockRejectedValue(error);

      await accountController.getAccountById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateAccount", () => {
    it("should update account successfully", async () => {
      const accountId = "account-id";
      const updateData = { name: "Updated Account" };
      const mockAccount = {
        _id: "account-id",
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
        user: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userId = "test-user-id";

      mockRequest.params = { id: accountId };
      mockRequest.body = updateData;
      mockRequest.user = { _id: userId };
      mockAccountService.updateAccount.mockResolvedValue(mockAccount as any);

      await accountController.updateAccount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAccountService.updateAccount).toHaveBeenCalledWith(
        accountId,
        userId,
        updateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Conta atualizada com sucesso",
          data: mockAccount,
        })
      );
    });

    it("should handle update account errors", async () => {
      const accountId = "account-id";
      const updateData = { name: "Updated Account" };
      const userId = "test-user-id";
      const error = new Error("Update failed");

      mockRequest.params = { id: accountId };
      mockRequest.body = updateData;
      mockRequest.user = { _id: userId };
      mockAccountService.updateAccount.mockRejectedValue(error);

      await accountController.updateAccount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
      const accountId = "account-id";
      const userId = "test-user-id";

      mockRequest.params = { id: accountId };
      mockRequest.user = { _id: userId };
      mockAccountService.deleteAccount.mockResolvedValue(undefined);

      await accountController.deleteAccount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAccountService.deleteAccount).toHaveBeenCalledWith(
        accountId,
        userId
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Conta excluída com sucesso",
        })
      );
    });

    it("should handle delete account errors", async () => {
      const accountId = "account-id";
      const userId = "test-user-id";
      const error = new Error("Delete failed");

      mockRequest.params = { id: accountId };
      mockRequest.user = { _id: userId };
      mockAccountService.deleteAccount.mockRejectedValue(error);

      await accountController.deleteAccount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
