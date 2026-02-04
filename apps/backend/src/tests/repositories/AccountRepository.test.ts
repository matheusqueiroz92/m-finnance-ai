import { AccountRepository } from "../../repositories/AccountRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import mongoose from "mongoose";

describe("AccountRepository", () => {
  let accountRepository: AccountRepository;
  let testUser: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    accountRepository = new AccountRepository();
    testUser = await TestDataFactory.createUser();
  });

  describe("create", () => {
    it("should create a new account", async () => {
      const accountData = {
        name: "Test Account",
        type: "checking" as const,
        balance: 1000,
        institution: "Test Bank",
        user: testUser._id,
      };

      const account = await accountRepository.create(accountData);

      expect(account).toBeDefined();
      expect(account.name).toBe("Test Account");
      expect(account.type).toBe("checking");
      expect(account.balance).toBe(1000);
      expect(account.institution).toBe("Test Bank");
      expect(account.user.toString()).toBe(testUser._id.toString());
    });

    it("should create account with default values", async () => {
      const accountData = {
        name: "Test Account",
        type: "savings" as const,
        institution: "Test Bank",
        user: testUser._id,
      };

      const account = await accountRepository.create(accountData);

      expect(account).toBeDefined();
      expect(account.balance).toBe(0); // Default value
      expect(account.isActive).toBe(true); // Default value
    });

    it("should throw error for invalid data", async () => {
      const invalidData = {
        name: "", // Invalid: empty name
        type: "invalid" as any, // Invalid: not in enum
        user: testUser._id,
      };

      await expect(accountRepository.create(invalidData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find account by id", async () => {
      const account = await TestDataFactory.createAccount(testUser._id);
      const foundAccount = await accountRepository.findById(
        (account._id as any).toString()
      );

      expect(foundAccount).toBeDefined();
      expect((foundAccount?._id as any).toString()).toBe(
        (account._id as any).toString()
      );
      expect(foundAccount?.name).toBe(account.name);
    });

    it("should find account by id and user", async () => {
      const account = await TestDataFactory.createAccount(testUser._id);
      const foundAccount = await accountRepository.findById(
        (account._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(foundAccount).toBeDefined();
      expect((foundAccount?._id as any).toString()).toBe(
        (account._id as any).toString()
      );
    });

    it("should return null for non-existent account", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const foundAccount = await accountRepository.findById(nonExistentId);

      expect(foundAccount).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const foundAccount = await accountRepository.findById("invalid-id");

      expect(foundAccount).toBeNull();
    });

    it("should return null for account belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const account = await TestDataFactory.createAccount(testUser._id);
      const foundAccount = await accountRepository.findById(
        (account._id as any).toString(),
        otherUser._id.toString()
      );

      expect(foundAccount).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find all accounts for user", async () => {
      await TestDataFactory.createAccount(testUser._id, { name: "Account 1" });
      await TestDataFactory.createAccount(testUser._id, { name: "Account 2" });

      const accounts = await accountRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(accounts).toHaveLength(2);
      expect(accounts[0].user.toString()).toBe(testUser._id.toString());
      expect(accounts[1].user.toString()).toBe(testUser._id.toString());
    });

    it("should filter accounts by type", async () => {
      await TestDataFactory.createAccount(testUser._id, { type: "checking" });
      await TestDataFactory.createAccount(testUser._id, { type: "savings" });

      const checkingAccounts = await accountRepository.findByUser(
        (testUser._id as any).toString(),
        { type: "checking" }
      );

      expect(checkingAccounts).toHaveLength(1);
      expect(checkingAccounts[0].type).toBe("checking");
    });

    it("should filter accounts by isActive", async () => {
      await TestDataFactory.createAccount(testUser._id, { isActive: true });
      await TestDataFactory.createAccount(testUser._id, { isActive: false });

      const activeAccounts = await accountRepository.findByUser(
        (testUser._id as any).toString(),
        { isActive: true }
      );

      expect(activeAccounts).toHaveLength(1);
      expect(activeAccounts[0].isActive).toBe(true);
    });

    it("should return empty array for user with no accounts", async () => {
      const accounts = await accountRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(accounts).toHaveLength(0);
    });

    it("should not return accounts from other users", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      await TestDataFactory.createAccount(testUser._id);
      await TestDataFactory.createAccount((otherUser._id as any).toString());

      const accounts = await accountRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(accounts).toHaveLength(1);
      expect(accounts[0].user.toString()).toBe(testUser._id.toString());
    });
  });

  describe("countByUser", () => {
    it("should return correct count for user", async () => {
      await TestDataFactory.createAccount(testUser._id);
      await TestDataFactory.createAccount(testUser._id);

      const count = await accountRepository.countByUser(
        (testUser._id as any).toString()
      );

      expect(count).toBe(2);
    });

    it("should filter count by type", async () => {
      await TestDataFactory.createAccount(testUser._id, { type: "checking" });
      await TestDataFactory.createAccount(testUser._id, { type: "savings" });

      const checkingCount = await accountRepository.countByUser(
        (testUser._id as any).toString(),
        { type: "checking" }
      );

      expect(checkingCount).toBe(1);
    });

    it("should return 0 for user with no accounts", async () => {
      const count = await accountRepository.countByUser(
        (testUser._id as any).toString()
      );

      expect(count).toBe(0);
    });
  });

  describe("update", () => {
    it("should update account successfully", async () => {
      const account = await TestDataFactory.createAccount(testUser._id);
      const updateData = {
        name: "Updated Account",
        balance: 2000,
      };

      const updatedAccount = await accountRepository.update(
        (account._id as any).toString(),
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedAccount).toBeDefined();
      expect(updatedAccount?.name).toBe("Updated Account");
      expect(updatedAccount?.balance).toBe(2000);
    });

    it("should return null for non-existent account", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Account" };

      const updatedAccount = await accountRepository.update(
        nonExistentId,
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedAccount).toBeNull();
    });

    it("should return null for account belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const account = await TestDataFactory.createAccount(testUser._id);
      const updateData = { name: "Updated Account" };

      const updatedAccount = await accountRepository.update(
        (account._id as any).toString(),
        otherUser._id.toString(),
        updateData
      );

      expect(updatedAccount).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const updateData = { name: "Updated Account" };

      const updatedAccount = await accountRepository.update(
        "invalid-id",
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedAccount).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete account successfully", async () => {
      const account = await TestDataFactory.createAccount(testUser._id);

      const result = await accountRepository.delete(
        (account._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(result).toBe(true);

      // Verify account is deleted
      const deletedAccount = await accountRepository.findById(
        (account._id as any).toString()
      );
      expect(deletedAccount).toBeNull();
    });

    it("should return false for non-existent account", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await accountRepository.delete(
        nonExistentId,
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });

    it("should return false for account belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const account = await TestDataFactory.createAccount(testUser._id);

      const result = await accountRepository.delete(
        (account._id as any).toString(),
        otherUser._id.toString()
      );

      expect(result).toBe(false);

      // Verify account still exists
      const existingAccount = await accountRepository.findById(
        (account._id as any).toString()
      );
      expect(existingAccount).toBeDefined();
    });

    it("should return false for invalid id", async () => {
      const result = await accountRepository.delete(
        "invalid-id",
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });
  });
});
