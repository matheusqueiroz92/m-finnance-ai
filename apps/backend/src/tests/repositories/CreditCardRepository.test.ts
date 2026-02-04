import { CreditCardRepository } from "../../repositories/CreditCardRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import { CreditCardModel } from "../../schemas/CreditCardSchema";
import mongoose from "mongoose";

describe("CreditCardRepository", () => {
  let creditCardRepository: CreditCardRepository;
  let testUser: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    creditCardRepository = new CreditCardRepository();
    testUser = await TestDataFactory.createUser();
  });

  describe("create", () => {
    it("should create a new credit card", async () => {
      const creditCardData = {
        cardNumber: "1234",
        cardBrand: "visa" as const,
        cardholderName: "John Doe",
        cardholderCpf: "12345678901",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
        isActive: true,
        user: testUser._id,
      };

      const creditCard = await creditCardRepository.create(creditCardData);

      expect(creditCard).toBeDefined();
      expect(creditCard.cardholderName).toBe("John Doe");
      expect(creditCard.cardNumber).toBe("1234");
      expect(creditCard.expiryDate).toBe("12/25");
      expect(creditCard.securityCode).toBeDefined(); // Criptografado
      expect(creditCard.isActive).toBe(true);
      expect(creditCard.user.toString()).toBe(testUser._id.toString());
    });

    it("should create credit card with default values", async () => {
      const creditCardData = {
        cardNumber: "5678",
        cardBrand: "mastercard" as const,
        cardholderName: "Jane Doe",
        cardholderCpf: "98765432100",
        expiryDate: "06/26",
        securityCode: "456",
        creditLimit: 3000,
        billingDueDay: 20,
        user: testUser._id,
      };

      const creditCard = await creditCardRepository.create(creditCardData);

      expect(creditCard).toBeDefined();
      expect(creditCard.isActive).toBe(true); // Default value
    });

    it("should throw error for invalid data", async () => {
      const invalidData = {
        cardNumber: "123", // Invalid: too short
        user: testUser._id,
      };

      await expect(creditCardRepository.create(invalidData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find credit card by id", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);
      const foundCreditCard = await creditCardRepository.findById(
        (creditCard._id as any).toString()
      );

      expect(foundCreditCard).toBeDefined();
      expect((foundCreditCard?._id as any).toString()).toBe(
        (creditCard._id as any).toString()
      );
      expect(foundCreditCard?.cardholderName).toBe(creditCard.cardholderName);
    });

    it("should find credit card by id and user", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);
      const foundCreditCard = await creditCardRepository.findById(
        (creditCard._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(foundCreditCard).toBeDefined();
      expect((foundCreditCard?._id as any).toString()).toBe(
        (creditCard._id as any).toString()
      );
    });

    it("should return null for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const foundCreditCard =
        await creditCardRepository.findById(nonExistentId);

      expect(foundCreditCard).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const foundCreditCard = await creditCardRepository.findById("invalid-id");

      expect(foundCreditCard).toBeNull();
    });

    it("should return null for credit card belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);
      const foundCreditCard = await creditCardRepository.findById(
        (creditCard._id as any).toString(),
        otherUser._id.toString()
      );

      expect(foundCreditCard).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find all credit cards for user", async () => {
      await TestDataFactory.createCreditCard(testUser._id, {
        cardNumber: "1111",
      });
      await TestDataFactory.createCreditCard(testUser._id, {
        cardNumber: "2222",
      });

      const creditCards = await creditCardRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(creditCards).toHaveLength(2);
      expect(creditCards[0].user.toString()).toBe(testUser._id.toString());
      expect(creditCards[1].user.toString()).toBe(testUser._id.toString());
    });

    it("should filter credit cards by isActive", async () => {
      await TestDataFactory.createCreditCard(testUser._id, {
        cardNumber: "3333",
        isActive: true,
      });
      await TestDataFactory.createCreditCard(testUser._id, {
        cardNumber: "4444",
        isActive: false,
      });

      const activeCreditCards = await creditCardRepository.findByUser(
        (testUser._id as any).toString(),
        true
      );

      expect(activeCreditCards).toHaveLength(1);
      expect(activeCreditCards[0].isActive).toBe(true);
    });

    it("should return empty array for user with no credit cards", async () => {
      const creditCards = await creditCardRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(creditCards).toHaveLength(0);
    });

    it("should not return credit cards from other users", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      await TestDataFactory.createCreditCard(testUser._id);
      await TestDataFactory.createCreditCard((otherUser._id as any).toString());

      const creditCards = await creditCardRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(creditCards).toHaveLength(1);
      expect(creditCards[0].user.toString()).toBe(testUser._id.toString());
    });
  });

  describe("findByCardNumber", () => {
    it("should find credit card by card number", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardNumber: "1234",
      });

      const foundCreditCard = await creditCardRepository.findByCardNumber(
        (testUser._id as any).toString(),
        "1234"
      );

      expect(foundCreditCard).toBeDefined();
      expect((foundCreditCard?._id as any).toString()).toBe(
        (creditCard._id as any).toString()
      );
    });

    it("should find credit card by last 4 digits", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardNumber: "1234",
      });

      const foundCreditCard = await creditCardRepository.findByCardNumber(
        (testUser._id as any).toString(),
        "1234"
      );

      expect(foundCreditCard).toBeDefined();
      expect((foundCreditCard?._id as any).toString()).toBe(
        (creditCard._id as any).toString()
      );
    });

    it("should return null for non-existent card number", async () => {
      const foundCreditCard = await creditCardRepository.findByCardNumber(
        (testUser._id as any).toString(),
        "9999999999999999"
      );

      expect(foundCreditCard).toBeNull();
    });
  });

  describe("update", () => {
    it("should update credit card successfully", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);
      const updateData = {
        cardholderName: "Updated Name",
        isActive: false,
      };

      const updatedCreditCard = await creditCardRepository.update(
        (creditCard._id as any).toString(),
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedCreditCard).toBeDefined();
      expect(updatedCreditCard?.cardholderName).toBe("Updated Name");
      expect(updatedCreditCard?.isActive).toBe(false);
    });

    it("should return null for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { cardholderName: "Updated Name" };

      const updatedCreditCard = await creditCardRepository.update(
        nonExistentId,
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedCreditCard).toBeNull();
    });

    it("should return null for credit card belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);
      const updateData = { cardholderName: "Updated Name" };

      const updatedCreditCard = await creditCardRepository.update(
        (creditCard._id as any).toString(),
        otherUser._id.toString(),
        updateData
      );

      expect(updatedCreditCard).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const updateData = { cardholderName: "Updated Name" };

      const updatedCreditCard = await creditCardRepository.update(
        "invalid-id",
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedCreditCard).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete credit card successfully", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);

      const result = await creditCardRepository.delete(
        (creditCard._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(result).toBe(true);

      // Verify credit card is deleted
      const deletedCreditCard = await creditCardRepository.findById(
        (creditCard._id as any).toString()
      );
      expect(deletedCreditCard).toBeNull();
    });

    it("should return false for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await creditCardRepository.delete(
        nonExistentId,
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });

    it("should return false for credit card belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const creditCard = await TestDataFactory.createCreditCard(testUser._id);

      const result = await creditCardRepository.delete(
        (creditCard._id as any).toString(),
        otherUser._id.toString()
      );

      expect(result).toBe(false);

      // Verify credit card still exists
      const existingCreditCard = await creditCardRepository.findById(
        (creditCard._id as any).toString()
      );
      expect(existingCreditCard).toBeDefined();
    });

    it("should return false for invalid id", async () => {
      const result = await creditCardRepository.delete(
        "invalid-id",
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });
  });
});
