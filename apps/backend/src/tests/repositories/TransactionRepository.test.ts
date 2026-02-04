import { TransactionRepository } from "../../repositories/TransactionRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";

describe("TransactionRepository", () => {
  let transactionRepository: TransactionRepository;
  let testUser: any;
  let testCategory: any;
  let testAccount: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    transactionRepository = new TransactionRepository();

    // Create test data
    testUser = await TestDataFactory.createUser();
    testCategory = await TestDataFactory.createCategory(
      testUser._id.toString()
    );
    testAccount = await TestDataFactory.createAccount(testUser._id.toString());
  });

  describe("create", () => {
    it("should create a new transaction", async () => {
      const transactionData = {
        amount: 100,
        type: "expense" as const,
        description: "Test Transaction",
        date: new Date(),
        user: testUser._id.toString(),
        category: testCategory._id,
        account: testAccount._id,
      };

      const transaction = await transactionRepository.create(
        transactionData as any
      );

      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(transactionData.amount);
      expect(transaction.type).toBe(transactionData.type);
      expect(transaction.description).toBe(transactionData.description);
      expect(transaction.user.toString()).toBe(testUser._id.toString());
      expect(transaction._id).toBeDefined();
    });
  });

  describe("findById", () => {
    it("should find transaction by id", async () => {
      const transaction = await TestDataFactory.createTransaction(
        (testUser._id as any).toString(),
        {
          category: testCategory._id,
          account: testAccount._id,
        }
      );

      const foundTransaction = await transactionRepository.findById(
        (transaction._id as any).toString()
      );

      expect(foundTransaction).toBeDefined();
      expect(foundTransaction?._id.toString()).toBe(
        (transaction._id as any).toString()
      );
    });

    it("should return null for non-existent id", async () => {
      const foundTransaction = await transactionRepository.findById(
        "507f1f77bcf86cd799439011"
      );

      expect(foundTransaction).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find transactions by user", async () => {
      // Create transactions for the user
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id as any,
        account: testAccount._id,
        amount: 100,
      });
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id as any,
        account: testAccount._id,
        amount: 200,
      });

      const transactions = await transactionRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(transactions).toHaveLength(2);
      expect(transactions[0].user.toString()).toBe(
        (testUser._id as any).toString()
      );
      expect(transactions[1].user.toString()).toBe(
        (testUser._id as any).toString()
      );
    });

    it("should return empty array for user with no transactions", async () => {
      const anotherUser = await TestDataFactory.createUser({
        email: "another@example.com",
      });
      const transactions = await transactionRepository.findByUser(
        (anotherUser._id as any).toString()
      );

      expect(transactions).toHaveLength(0);
    });
  });

  describe("findByUser with pagination", () => {
    it("should find transactions with pagination", async () => {
      // Create multiple transactions
      for (let i = 0; i < 5; i++) {
        await TestDataFactory.createTransaction(testUser._id.toString(), {
          category: testCategory._id,
          account: testAccount._id,
          amount: 100 + i,
        });
      }

      const transactions = await transactionRepository.findByUser(
        testUser._id.toString(),
        {
          page: 1,
          limit: 3,
        }
      );

      expect(transactions).toHaveLength(3);
    });

    it("should handle empty results", async () => {
      const transactions = await transactionRepository.findByUser(
        testUser._id.toString(),
        {
          page: 1,
          limit: 10,
        }
      );

      expect(transactions).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update transaction successfully", async () => {
      const transaction = await TestDataFactory.createTransaction(
        testUser._id.toString(),
        {
          category: testCategory._id,
          account: testAccount._id,
        }
      );

      const updateData = {
        amount: 500,
        description: "Updated Transaction",
      };

      const updatedTransaction = await transactionRepository.update(
        (transaction._id as any).toString(),
        testUser._id.toString(),
        updateData
      );

      expect(updatedTransaction).toBeDefined();
      expect(updatedTransaction?.amount).toBe(updateData.amount);
      expect(updatedTransaction?.description).toBe(updateData.description);
    });

    it("should return null for non-existent transaction", async () => {
      const updateData = { amount: 500 };

      const updatedTransaction = await transactionRepository.update(
        "507f1f77bcf86cd799439011",
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedTransaction).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete transaction successfully", async () => {
      const transaction = await TestDataFactory.createTransaction(
        testUser._id.toString(),
        {
          category: testCategory._id,
          account: testAccount._id,
        }
      );

      const result = await transactionRepository.delete(
        (transaction._id as any).toString(),
        testUser._id.toString()
      );

      expect(result).toBe(true);

      // Verify transaction is deleted
      const deletedTransaction = await transactionRepository.findById(
        (transaction._id as any).toString()
      );
      expect(deletedTransaction).toBeNull();
    });

    it("should return false for non-existent transaction", async () => {
      const result = await transactionRepository.delete(
        "507f1f77bcf86cd799439011",
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });
  });

  describe("findByCategory", () => {
    it("should find transactions by category", async () => {
      // Create transactions with the same category
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id as any,
        account: testAccount._id,
        amount: 100,
      });
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id as any,
        account: testAccount._id,
        amount: 200,
      });

      const transactions = await transactionRepository.findByCategory(
        (testUser._id as any).toString(),
        testCategory._id.toString()
      );

      expect(transactions).toHaveLength(2);
      expect(transactions[0].category._id.toString()).toBe(
        (testCategory._id as any).toString()
      );
      expect(transactions[1].category._id.toString()).toBe(
        (testCategory._id as any).toString()
      );
    });

    it("should return empty array for category with no transactions", async () => {
      const anotherCategory = await TestDataFactory.createCategory(
        (testUser._id as any).toString(),
        {
          name: "Another Category",
        }
      );

      const transactions = await transactionRepository.findByCategory(
        (testUser._id as any).toString(),
        (anotherCategory._id as any).toString()
      );

      expect(transactions).toHaveLength(0);
    });
  });

  describe("findByAccount", () => {
    it("should find transactions by account", async () => {
      // Create transactions with the same account
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id,
        account: testAccount._id,
        amount: 100,
      });
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id,
        account: testAccount._id,
        amount: 200,
      });

      const transactions = await transactionRepository.findByAccount(
        testUser._id.toString(),
        testAccount._id.toString()
      );

      expect(transactions).toHaveLength(2);
      expect(transactions[0].account._id.toString()).toBe(
        testAccount._id.toString()
      );
      expect(transactions[1].account._id.toString()).toBe(
        testAccount._id.toString()
      );
    });

    it("should return empty array for account with no transactions", async () => {
      const anotherAccount = await TestDataFactory.createAccount(
        testUser._id.toString(),
        {
          name: "Another Account",
        }
      );

      const transactions = await transactionRepository.findByAccount(
        testUser._id.toString(),
        (anotherAccount._id as any).toString()
      );

      expect(transactions).toHaveLength(0);
    });
  });

  describe("countByUser", () => {
    it("should return correct transaction count for user", async () => {
      // Create multiple transactions
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id as any,
        account: testAccount._id,
      });
      await TestDataFactory.createTransaction(testUser._id.toString(), {
        category: testCategory._id as any,
        account: testAccount._id,
      });

      const count = await transactionRepository.countByUser(
        (testUser._id as any).toString()
      );

      expect(count).toBe(2);
    });

    it("should return 0 when no transactions exist for user", async () => {
      const count = await transactionRepository.countByUser(
        (testUser._id as any).toString()
      );

      expect(count).toBe(0);
    });
  });
});
