import { InvestmentRepository } from "../../repositories/InvestmentRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import mongoose from "mongoose";

describe("InvestmentRepository", () => {
  let investmentRepository: InvestmentRepository;
  let testUser: any;
  let testAccount: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    investmentRepository = new InvestmentRepository();
    testUser = await TestDataFactory.createUser();
    testAccount = await TestDataFactory.createAccount(testUser._id);
  });

  describe("create", () => {
    it("should create a new investment", async () => {
      const investmentData = {
        name: "Apple Stock",
        type: "stock",
        symbol: "AAPL",
        amount: 10,
        initialValue: 1500.0,
        currentValue: 1550.0,
        acquisitionDate: new Date("2024-01-01"),
        account: testAccount._id,
        user: testUser._id,
      };

      const investment = await investmentRepository.create(
        investmentData as any
      );

      expect(investment).toBeDefined();
      expect(investment.name).toBe("Apple Stock");
      expect(investment.type).toBe("stock");
      expect(investment.symbol).toBe("AAPL");
      expect(investment.amount).toBe(10);
      expect(investment.initialValue).toBe(1500.0);
      expect(investment.currentValue).toBe(1550.0);
      expect(investment.user.toString()).toBe(testUser._id.toString());
      expect(investment.account.toString()).toBe(testAccount._id.toString());
    });

    it("should create investment with default values", async () => {
      const investmentData = {
        name: "Tesla Stock",
        type: "stock",
        symbol: "TSLA",
        amount: 5,
        initialValue: 1000.0,
        currentValue: 1000.0,
        acquisitionDate: new Date("2024-01-01"),
        account: testAccount._id,
        user: testUser._id,
      };

      const investment = await investmentRepository.create(
        investmentData as any
      );

      expect(investment).toBeDefined();
      expect(investment.currentValue).toBe(1000.0); // Default to initial value
      expect(investment.isActive).toBe(true); // Default value
    });

    it("should throw error for invalid data", async () => {
      const invalidData = {
        name: "", // Invalid: empty name
        type: "invalid", // Invalid: not in enum
        user: testUser._id,
      };

      await expect(
        investmentRepository.create(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find investment by id", async () => {
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );
      const foundInvestment = await investmentRepository.findById(
        (investment._id as any).toString()
      );

      expect(foundInvestment).toBeDefined();
      expect((foundInvestment?._id as any).toString()).toBe(
        (investment._id as any).toString()
      );
      expect(foundInvestment?.name).toBe(investment.name);
    });

    it("should find investment by id and user", async () => {
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );
      const foundInvestment = await investmentRepository.findById(
        (investment._id as any).toString(),
        testUser._id.toString()
      );

      expect(foundInvestment).toBeDefined();
      expect((foundInvestment?._id as any).toString()).toBe(
        (investment._id as any).toString()
      );
    });

    it("should return null for non-existent investment", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const foundInvestment =
        await investmentRepository.findById(nonExistentId);

      expect(foundInvestment).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const foundInvestment = await investmentRepository.findById("invalid-id");

      expect(foundInvestment).toBeNull();
    });

    it("should return null for investment belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );
      const foundInvestment = await investmentRepository.findById(
        (investment._id as any).toString(),
        (otherUser._id as any).toString()
      );

      expect(foundInvestment).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find all investments for user", async () => {
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        name: "Investment 1",
      });
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        name: "Investment 2",
      });

      const investments = await investmentRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(investments).toHaveLength(2);
      expect(investments[0].user.toString()).toBe(
        (testUser._id as any).toString()
      );
      expect(investments[1].user.toString()).toBe(
        (testUser._id as any).toString()
      );
    });

    it("should filter investments by type", async () => {
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        type: "stock",
      });
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        type: "bond",
      });

      const stockInvestments = await investmentRepository.findByUser(
        (testUser._id as any).toString(),
        { type: "stock" }
      );

      expect(stockInvestments).toHaveLength(1);
      expect(stockInvestments[0].type).toBe("stock");
    });

    it("should filter investments by isActive", async () => {
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        isActive: true,
      });
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        isActive: false,
      });

      const activeInvestments = await investmentRepository.findByUser(
        (testUser._id as any).toString(),
        { isActive: true }
      );

      expect(activeInvestments).toHaveLength(1);
      expect(activeInvestments[0].isActive).toBe(true);
    });

    it("should filter investments by account", async () => {
      const otherAccount = await TestDataFactory.createAccount(
        testUser._id as any
      );
      await TestDataFactory.createInvestment(testUser._id, testAccount._id);
      await TestDataFactory.createInvestment(
        testUser._id,
        otherAccount._id as any
      );

      const accountInvestments = await investmentRepository.findByUser(
        (testUser._id as any).toString(),
        { account: testAccount._id.toString() }
      );

      expect(accountInvestments).toHaveLength(1);
      expect(accountInvestments[0].account._id.toString()).toBe(
        (testAccount._id as any).toString()
      );
    });

    it("should return empty array for user with no investments", async () => {
      const investments = await investmentRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(investments).toHaveLength(0);
    });

    it("should not return investments from other users", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const otherAccount = await TestDataFactory.createAccount(
        otherUser._id as any
      );
      await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id as any
      );
      await TestDataFactory.createInvestment(
        otherUser._id as any,
        otherAccount._id as any
      );

      const investments = await investmentRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(investments).toHaveLength(1);
      expect(investments[0].user.toString()).toBe(
        (testUser._id as any).toString()
      );
    });
  });

  describe("countByUser", () => {
    it("should return correct count for user", async () => {
      await TestDataFactory.createInvestment(testUser._id, testAccount._id);
      await TestDataFactory.createInvestment(testUser._id, testAccount._id);

      const count = await investmentRepository.countByUser(
        (testUser._id as any).toString()
      );

      expect(count).toBe(2);
    });

    it("should filter count by type", async () => {
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        type: "stock",
      });
      await TestDataFactory.createInvestment(testUser._id, testAccount._id, {
        type: "bond",
      });

      const stockCount = await investmentRepository.countByUser(
        (testUser._id as any).toString(),
        { type: "stock" }
      );

      expect(stockCount).toBe(1);
    });

    it("should return 0 for user with no investments", async () => {
      const count = await investmentRepository.countByUser(
        (testUser._id as any).toString()
      );

      expect(count).toBe(0);
    });
  });

  describe("update", () => {
    it("should update investment successfully", async () => {
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );
      const updateData = {
        name: "Updated Investment",
        currentValue: 200.0,
      };

      const updatedInvestment = await investmentRepository.update(
        (investment._id as any).toString(),
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedInvestment).toBeDefined();
      expect(updatedInvestment?.name).toBe("Updated Investment");
      expect(updatedInvestment?.currentValue).toBe(200.0);
    });

    it("should recalculate performance on value update", async () => {
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id,
        {
          acquisitionPrice: 100.0,
          currentValue: 100.0,
        }
      );

      const updateData = { currentValue: 120.0 };

      const updatedInvestment = await investmentRepository.update(
        (investment._id as any).toString(),
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedInvestment?.currentValue).toBe(120.0);
      expect(updatedInvestment?.performance).toBeDefined();
    });

    it("should return null for non-existent investment", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Investment" };

      const updatedInvestment = await investmentRepository.update(
        nonExistentId,
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedInvestment).toBeNull();
    });

    it("should return null for investment belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );
      const updateData = { name: "Updated Investment" };

      const updatedInvestment = await investmentRepository.update(
        (investment._id as any).toString(),
        (otherUser._id as any).toString(),
        updateData
      );

      expect(updatedInvestment).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const updateData = { name: "Updated Investment" };

      const updatedInvestment = await investmentRepository.update(
        "invalid-id",
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedInvestment).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete investment successfully", async () => {
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );

      const result = await investmentRepository.delete(
        (investment._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(result).toBe(true);

      // Verify investment is deleted
      const deletedInvestment = await investmentRepository.findById(
        (investment._id as any).toString()
      );
      expect(deletedInvestment).toBeNull();
    });

    it("should return false for non-existent investment", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await investmentRepository.delete(
        nonExistentId,
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });

    it("should return false for investment belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const investment = await TestDataFactory.createInvestment(
        testUser._id,
        testAccount._id
      );

      const result = await investmentRepository.delete(
        (investment._id as any).toString(),
        (otherUser._id as any).toString()
      );

      expect(result).toBe(false);

      // Verify investment still exists
      const existingInvestment = await investmentRepository.findById(
        (investment._id as any).toString()
      );
      expect(existingInvestment).toBeDefined();
    });

    it("should return false for invalid id", async () => {
      const result = await investmentRepository.delete(
        "invalid-id",
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });
  });
});
