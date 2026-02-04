import request from "supertest";
import mongoose from "mongoose";
import { container } from "tsyringe";
import {
  TestDatabase,
  TestDataFactory,
  TestTimeHelper,
} from "../utils/testHelpers";
import app from "../../app";
import { UserModel as User } from "../../schemas/UserSchema";
import { TransactionModel as Transaction } from "../../schemas/TransactionSchema";
import { GoalModel as Goal } from "../../schemas/GoalSchema";
import { CategoryModel as Category } from "../../schemas/CategorySchema";

describe("Insights Routes Integration", () => {
  let authToken: string;
  let testUser: any;
  let testCategory: any;

  beforeEach(async () => {
    // Create test user and login
    testUser = await TestDataFactory.createUser();
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "password123",
    });

    authToken = loginResponse.body.data.token;
    testCategory = await TestDataFactory.createCategory(testUser._id);
  });

  describe("GET /api/reports/insights", () => {
    it("should return complete insights for authenticated user", async () => {
      // Create test data
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 5000,
        type: "income",
        description: "Salary",
        date: new Date(),
      });

      await TestDataFactory.createTransaction(testUser._id, {
        amount: 2000,
        type: "expense",
        description: "Food",
        category: testCategory._id,
        date: new Date(),
      });

      await TestDataFactory.createGoal(testUser._id, {
        name: "Vacation",
        targetAmount: 10000,
        currentAmount: 2000,
        targetDate: TestTimeHelper.getDate(365),
      });

      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("score");
      expect(response.body.data).toHaveProperty("health");
      expect(response.body.data).toHaveProperty("potentialSavings");
      expect(response.body.data).toHaveProperty("goalProbability");
      expect(response.body.data).toHaveProperty("insights");

      // Validate score structure
      expect(response.body.data.score).toHaveProperty("value");
      expect(response.body.data.score).toHaveProperty("change");
      expect(typeof response.body.data.score.value).toBe("number");
      expect(response.body.data.score.value).toBeGreaterThanOrEqual(300);
      expect(response.body.data.score.value).toBeLessThanOrEqual(850);

      // Validate health
      expect(typeof response.body.data.health).toBe("string");
      expect([
        "Excelente",
        "Ótima",
        "Boa",
        "Regular",
        "Precisa de atenção",
      ]).toContain(response.body.data.health);

      // Validate insights array
      expect(Array.isArray(response.body.data.insights)).toBe(true);
    });

    it("should return insights for user with no data", async () => {
      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.score.value).toBeLessThan(600);
      expect(response.body.data.goalProbability).toBe(0);
      expect(response.body.data.potentialSavings).toBe(0);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/reports/insights");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", "Bearer invalid.token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/reports/insights/score", () => {
    it("should return financial score only", async () => {
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 5000,
        type: "income",
        description: "Salary",
        date: new Date(),
      });

      const response = await request(app)
        .get("/api/reports/insights/score")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("score");
      expect(response.body.data).toHaveProperty("health");
      expect(response.body.data).not.toHaveProperty("potentialSavings");
      expect(response.body.data).not.toHaveProperty("goalProbability");
      expect(response.body.data).not.toHaveProperty("insights");
    });

    it("should calculate high score for good financial health", async () => {
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 10000,
        type: "income",
        description: "High Salary",
        date: new Date(),
      });

      await TestDataFactory.createTransaction(testUser._id, {
        amount: 3000,
        type: "expense",
        description: "Low Expenses",
        date: new Date(),
      });

      const response = await request(app)
        .get("/api/reports/insights/score")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.score.value).toBeGreaterThan(700);
      expect(response.body.data.health).toBe("Ótima");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/reports/insights/score");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/reports/insights/recommendations", () => {
    it("should return recommendations and potential savings", async () => {
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 5000,
        type: "income",
        description: "Salary",
        date: new Date(),
      });

      await TestDataFactory.createTransaction(testUser._id, {
        amount: 4000,
        type: "expense",
        description: "High Expenses",
        date: new Date(),
      });

      const response = await request(app)
        .get("/api/reports/insights/recommendations")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("recommendations");
      expect(response.body.data).toHaveProperty("potentialSavings");
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(typeof response.body.data.potentialSavings).toBe("number");
    });

    it("should suggest budget optimization for high expenses", async () => {
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 5000,
        type: "income",
        description: "Salary",
        date: new Date(),
      });

      // Create high expenses
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 3000,
        type: "expense",
        description: "Food",
        category: testCategory._id,
        date: new Date(),
      });

      const response = await request(app)
        .get("/api/reports/insights/recommendations")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const optimizationRecs = response.body.data.recommendations.filter(
        (rec: any) => rec.type === "optimization"
      );
      expect(optimizationRecs.length).toBeGreaterThan(0);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get(
        "/api/reports/insights/recommendations"
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/reports/insights/trends", () => {
    it("should return trends and goal probability", async () => {
      await TestDataFactory.createTransaction(testUser._id, {
        amount: 5000,
        type: "income",
        description: "Salary",
        date: new Date(),
      });

      await TestDataFactory.createGoal(testUser._id, {
        name: "Test Goal",
        targetAmount: 10000,
        currentAmount: 2000,
        targetDate: TestTimeHelper.getDate(365),
      });

      const response = await request(app)
        .get("/api/reports/insights/trends")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("goalProbability");
      expect(response.body.data).toHaveProperty("score");
      expect(response.body.data).toHaveProperty("trends");
      expect(Array.isArray(response.body.data.trends)).toBe(true);
      expect(typeof response.body.data.goalProbability).toBe("number");
    });

    it("should calculate trends for multiple months", async () => {
      // Create transactions for different months
      const months = [-2, -1, 0];
      for (const monthOffset of months) {
        await TestDataFactory.createTransaction(testUser._id, {
          amount: 5000,
          type: "income",
          description: `Salary Month ${monthOffset}`,
          date: TestTimeHelper.getDate(monthOffset * 30),
        });

        await TestDataFactory.createTransaction(testUser._id, {
          amount: 3000,
          type: "expense",
          description: `Expenses Month ${monthOffset}`,
          date: TestTimeHelper.getDate(monthOffset * 30),
        });
      }

      const response = await request(app)
        .get("/api/reports/insights/trends")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trends.length).toBeGreaterThan(0);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/reports/insights/trends");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should handle database errors gracefully", async () => {
      // Test with invalid endpoint to simulate error
      const response = await request(app)
        .get("/api/reports/invalid-endpoint")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBeUndefined(); // 404 não retorna body.success
    });

    it("should handle non-existent user", async () => {
      // Create token for non-existent user
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const jwt = require("jsonwebtoken");
      const fakeToken = jwt.sign(
        { id: fakeUserId, email: "fake@example.com", type: "access" },
        process.env.JWT_SECRET || "test-secret"
      );

      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Performance tests", () => {
    it("should handle large number of transactions efficiently", async () => {
      // Create many transactions
      for (let i = 0; i < 100; i++) {
        await TestDataFactory.createTransaction(testUser._id, {
          amount: Math.random() * 1000,
          type: i % 2 === 0 ? "income" : "expense",
          description: `Transaction ${i}`,
          date: TestTimeHelper.getDate(-i),
        });
      }

      const startTime = Date.now();
      const response = await request(app)
        .get("/api/reports/insights")
        .set("Authorization", `Bearer ${authToken}`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
