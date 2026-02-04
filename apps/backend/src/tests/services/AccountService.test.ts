import mongoose from "mongoose";
import { AccountService } from "../../services/AccountService";
import { UserModel as User } from "../../schemas/UserSchema";
import { ApiError } from "../../utils/ApiError";

let userId: mongoose.Types.ObjectId;

beforeEach(async () => {
  // Create test user for each test
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  userId = user._id;
});

describe("AccountService", () => {
  let accountService: AccountService;
  let mockAccountRepository: any;
  let mockTransactionRepository: any;

  beforeEach(() => {
    // Mock repositories for testing
    mockAccountRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUser: jest.fn(), // Adicionado para compatibilidade
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTransactionRepository = {
      findByAccount: jest.fn(),
    };

    accountService = new AccountService(
      mockAccountRepository,
      mockTransactionRepository
    );
  });

  describe("createAccount", () => {
    it("should create a new account", async () => {
      const accountData = {
        name: "Test Account",
        type: "checking" as const,
        balance: 1000,
        institution: "Test Bank",
        accountNumber: "1234",
      };

      const mockAccount = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
        accountNumber: "1234",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.create.mockResolvedValue(mockAccount);

      const account = await accountService.createAccount(
        userId.toString(),
        accountData
      );

      expect(account).toBeDefined();
      expect(account.name).toBe("Test Account");
      expect(account.balance).toBe(1000);
      expect(account._id).toBeDefined();
      expect(mockAccountRepository.create).toHaveBeenCalled();
    });
  });

  describe("getAccountsByUserId", () => {
    it("should get all accounts for a user", async () => {
      const mockAccounts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Checking Account",
          type: "checking",
          balance: 1000,
          institution: "Test Bank",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Savings Account",
          type: "savings",
          balance: 2000,
          institution: "Test Bank",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAccountRepository.findByUser.mockResolvedValue(mockAccounts);

      const accounts = await accountService.getAccountsByUserId(
        userId.toString()
      );

      expect(accounts).toHaveLength(2);
      expect(accounts[0].name).toBe("Checking Account");
      expect(accounts[1].name).toBe("Savings Account");
      expect(mockAccountRepository.findByUser).toHaveBeenCalledWith(
        userId.toString()
      );
    });
  });

  describe("getAccountById", () => {
    it("should get account by ID", async () => {
      const accountId = new mongoose.Types.ObjectId().toString();
      const mockAccount = {
        _id: new mongoose.Types.ObjectId(accountId),
        name: "Test Account",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      const account = await accountService.getAccountById(
        accountId,
        userId.toString()
      );

      expect(account).toBeDefined();
      expect(account._id.toString()).toBe(accountId);
      expect(account.name).toBe("Test Account");
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(
        accountId,
        userId.toString()
      );
    });

    it("should throw error if account not found", async () => {
      const invalidAccountId = new mongoose.Types.ObjectId().toString();

      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(
        accountService.getAccountById(invalidAccountId, userId.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("updateAccount", () => {
    it("should update account details", async () => {
      const accountId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Account",
        institution: "New Bank",
      };

      const mockUpdatedAccount = {
        _id: new mongoose.Types.ObjectId(accountId),
        name: "Updated Account",
        type: "checking",
        balance: 1000,
        institution: "New Bank",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.update.mockResolvedValue(mockUpdatedAccount);

      const account = await accountService.updateAccount(
        accountId,
        userId.toString(),
        updateData
      );

      expect(account.name).toBe("Updated Account");
      expect(account.institution).toBe("New Bank");
      expect(account.balance).toBe(1000); // Balance should not change
      expect(mockAccountRepository.update).toHaveBeenCalledWith(
        accountId,
        userId.toString(),
        updateData,
        expect.any(Object) // Session object from TransactionManager
      );
    });

    it("should not update balance directly", async () => {
      const accountId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Account Name", // Valid field
      };

      const mockUpdatedAccount = {
        _id: new mongoose.Types.ObjectId(accountId),
        name: "Updated Account Name",
        type: "checking",
        balance: 1000,
        institution: "Test Bank",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.update.mockResolvedValue(mockUpdatedAccount);

      const account = await accountService.updateAccount(
        accountId,
        userId.toString(),
        updateData
      );

      expect(account.name).toBe("Updated Account Name");
      expect(account.balance).toBe(1000); // Balance should not change
    });
  });

  describe("deleteAccount", () => {
    it("should delete an account", async () => {
      const accountId = new mongoose.Types.ObjectId().toString();

      mockTransactionRepository.findByAccount.mockResolvedValue([]);
      mockAccountRepository.delete.mockResolvedValue(true);

      await accountService.deleteAccount(accountId, userId.toString());

      expect(mockTransactionRepository.findByAccount).toHaveBeenCalledWith(
        userId.toString(),
        accountId
      );
      expect(mockAccountRepository.delete).toHaveBeenCalledWith(
        accountId,
        userId.toString()
      );
    });

    it("should throw error if account has transactions", async () => {
      const accountId = new mongoose.Types.ObjectId().toString();

      mockTransactionRepository.findByAccount.mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), amount: 100 },
      ]);

      await expect(
        accountService.deleteAccount(accountId, userId.toString())
      ).rejects.toThrow(ApiError);

      expect(mockTransactionRepository.findByAccount).toHaveBeenCalledWith(
        userId.toString(),
        accountId
      );
    });
  });
});
