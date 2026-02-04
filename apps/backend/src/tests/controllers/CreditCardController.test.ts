import request from "supertest";
import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import app from "../../app";

describe("CreditCardController", () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.cleanup();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    testUser = await TestDataFactory.createUser();
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "password123",
    });
    authToken = loginResponse.body.data.token;
  });

  describe("POST /api/credit-cards", () => {
    it("should create a new credit card", async () => {
      const creditCardData = {
        cardNumber: "1234567890123456", // 16 dígitos válidos
        cardBrand: "visa",
        cardholderName: "John Doe",
        cardholderCpf: "12345678909", // CPF válido (apenas dígitos)
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const response = await request(app)
        .post("/api/credit-cards")
        .set("Authorization", `Bearer ${authToken}`)
        .send(creditCardData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cardholderName).toBe(
        creditCardData.cardholderName
      );
      expect(response.body.data.creditLimit).toBe(creditCardData.creditLimit);
      expect(response.body.data).toHaveProperty("_id");
    });

    it("should return 401 if not authenticated", async () => {
      const creditCardData = {
        cardNumber: "1234",
        cardBrand: "visa",
        cardholderName: "John Doe",
        cardholderCpf: "123.456.789-00",
        expiryDate: "12/25",
        securityCode: "123",
        creditLimit: 5000,
        billingDueDay: 15,
      };

      const response = await request(app)
        .post("/api/credit-cards")
        .send(creditCardData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid credit card data", async () => {
      const invalidCreditCardData = {
        cardNumber: "123", // Invalid card number
        cardBrand: "INVALID_BRAND",
        cardholderName: "Jo", // Too short
        creditLimit: -1000, // Negative limit
      };

      const response = await request(app)
        .post("/api/credit-cards")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidCreditCardData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/credit-cards", () => {
    it("should get all credit cards for the user", async () => {
      await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "John Doe",
        creditLimit: 5000,
      });
      await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Jane Doe",
        creditLimit: 3000,
      });

      const response = await request(app)
        .get("/api/credit-cards")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty("_id");
    });

    it("should filter credit cards by isActive", async () => {
      await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Active Card",
        isActive: true,
      });
      await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Inactive Card",
        isActive: false,
      });

      const response = await request(app)
        .get("/api/credit-cards?isActive=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].isActive).toBe(true);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/credit-cards");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/credit-cards/:id", () => {
    it("should get a credit card by ID", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
        creditLimit: 5000,
      });

      const response = await request(app)
        .get(`/api/credit-cards/${creditCard._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cardholderName).toBe(creditCard.cardholderName);
    });

    it("should return 404 for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/credit-cards/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
      });

      const response = await request(app).get(
        `/api/credit-cards/${creditCard._id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/credit-cards/:id", () => {
    it("should update a credit card", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Old Name",
        creditLimit: 5000,
      });
      const updateData = { cardholderName: "New Name", creditLimit: 7000 };

      const response = await request(app)
        .put(`/api/credit-cards/${creditCard._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cardholderName).toBe(updateData.cardholderName);
      expect(response.body.data.creditLimit).toBe(updateData.creditLimit);
    });

    it("should return 404 for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { cardholderName: "New Name" };

      const response = await request(app)
        .put(`/api/credit-cards/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Old Name",
      });
      const updateData = { cardholderName: "New Name" };

      const response = await request(app)
        .put(`/api/credit-cards/${creditCard._id}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid update data", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Old Name",
      });
      const invalidUpdateData = { creditLimit: -1000 }; // Negative limit

      const response = await request(app)
        .put(`/api/credit-cards/${creditCard._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/credit-cards/:id", () => {
    it("should delete a credit card", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "To Delete",
      });

      const response = await request(app)
        .delete(`/api/credit-cards/${creditCard._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);

      const checkCreditCard = await request(app)
        .get(`/api/credit-cards/${creditCard._id}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(checkCreditCard.status).toBe(404);
    });

    it("should return 404 for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/credit-cards/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "To Delete",
      });

      const response = await request(app).delete(
        `/api/credit-cards/${creditCard._id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/credit-cards/:id/balance", () => {
    it("should get credit card balance", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
        creditLimit: 5000,
      });

      const response = await request(app)
        .get(`/api/credit-cards/${creditCard._id}/balance`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("availableLimit");
      expect(response.body.data).toHaveProperty("currentBalance");
      expect(response.body.data).toHaveProperty("creditLimit");
    });

    it("should return 404 for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/credit-cards/${nonExistentId}/balance`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
      });

      const response = await request(app).get(
        `/api/credit-cards/${creditCard._id}/balance`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/credit-cards/:id/validate-security-code", () => {
    it("should validate correct security code", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
        securityCode: "123",
      });

      const response = await request(app)
        .post(`/api/credit-cards/${creditCard._id}/validate-security-code`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ securityCode: "123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
    });

    it("should reject incorrect security code", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
        securityCode: "123",
      });

      const response = await request(app)
        .post(`/api/credit-cards/${creditCard._id}/validate-security-code`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ securityCode: "999" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
    });

    it("should return 400 if security code is missing", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
      });

      const response = await request(app)
        .post(`/api/credit-cards/${creditCard._id}/validate-security-code`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent credit card", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/credit-cards/${nonExistentId}/validate-security-code`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ securityCode: "123" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const creditCard = await TestDataFactory.createCreditCard(testUser._id, {
        cardholderName: "Test Card",
      });

      const response = await request(app)
        .post(`/api/credit-cards/${creditCard._id}/validate-security-code`)
        .send({ securityCode: "123" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
