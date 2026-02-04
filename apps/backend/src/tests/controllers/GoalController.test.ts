import request from "supertest";
import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import app from "../../app";

describe("GoalController", () => {
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

  describe("POST /api/goals", () => {
    it("should create a new goal", async () => {
      const goalData = {
        name: "Buy a Car",
        targetAmount: 50000,
        currentAmount: 10000,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        category: "Personal",
        icon: "car",
        notes: "Saving for a new car",
      };

      const response = await request(app)
        .post("/api/goals")
        .set("Authorization", `Bearer ${authToken}`)
        .send(goalData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(goalData.name);
      expect(response.body.data.targetAmount).toBe(goalData.targetAmount);
      expect(response.body.data).toHaveProperty("_id");
    });

    it("should return 401 if not authenticated", async () => {
      const goalData = {
        name: "Buy a Car",
        targetAmount: 50000,
        currentAmount: 10000,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };

      const response = await request(app).post("/api/goals").send(goalData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid goal data", async () => {
      const invalidGoalData = {
        name: "", // Invalid name
        targetAmount: -100, // Invalid target amount
      };

      const response = await request(app)
        .post("/api/goals")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidGoalData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/goals", () => {
    it("should get all goals for the user", async () => {
      await TestDataFactory.createGoal(testUser._id, {
        name: "Goal 1",
        targetAmount: 10000,
      });
      await TestDataFactory.createGoal(testUser._id, {
        name: "Goal 2",
        targetAmount: 20000,
      });

      const response = await request(app)
        .get("/api/goals")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty("_id");
    });

    it("should filter goals by isCompleted", async () => {
      await TestDataFactory.createGoal(testUser._id, {
        name: "Completed Goal",
        targetAmount: 10000,
        currentAmount: 10000,
        isCompleted: true,
      });
      await TestDataFactory.createGoal(testUser._id, {
        name: "Incomplete Goal",
        targetAmount: 20000,
        currentAmount: 5000,
        isCompleted: false,
      });

      const response = await request(app)
        .get("/api/goals?isCompleted=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("Completed Goal");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/goals");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/goals/:id", () => {
    it("should get a goal by ID", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "Test Goal",
        targetAmount: 15000,
      });

      const response = await request(app)
        .get(`/api/goals/${goal._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(goal.name);
    });

    it("should return 404 for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/goals/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "Test Goal",
        targetAmount: 15000,
      });

      const response = await request(app).get(`/api/goals/${goal._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/goals/:id", () => {
    it("should update a goal", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "Old Goal Name",
        targetAmount: 10000,
      });
      const updateData = { name: "New Goal Name", targetAmount: 15000 };

      const response = await request(app)
        .put(`/api/goals/${goal._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.targetAmount).toBe(updateData.targetAmount);
    });

    it("should return 404 for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { name: "New Goal Name" };

      const response = await request(app)
        .put(`/api/goals/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "Old Goal Name",
        targetAmount: 10000,
      });
      const updateData = { name: "New Goal Name" };

      const response = await request(app)
        .put(`/api/goals/${goal._id}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid update data", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "Old Goal Name",
        targetAmount: 10000,
      });
      const invalidUpdateData = { targetAmount: -100 }; // Invalid amount

      const response = await request(app)
        .put(`/api/goals/${goal._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/goals/:id", () => {
    it("should delete a goal", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "To Delete",
        targetAmount: 10000,
      });

      const response = await request(app)
        .delete(`/api/goals/${goal._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);

      const checkGoal = await request(app)
        .get(`/api/goals/${goal._id}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(checkGoal.status).toBe(404);
    });

    it("should return 404 for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/goals/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 if not authenticated", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        name: "To Delete",
        targetAmount: 10000,
      });

      const response = await request(app).delete(`/api/goals/${goal._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/goals/stats", () => {
    it("should get goal statistics", async () => {
      await TestDataFactory.createGoal(testUser._id, {
        name: "Goal 1",
        targetAmount: 10000,
        currentAmount: 5000,
      });
      await TestDataFactory.createGoal(testUser._id, {
        name: "Goal 2",
        targetAmount: 20000,
        currentAmount: 20000,
        isCompleted: true,
      });

      const response = await request(app)
        .get("/api/goals/stats")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("totalGoals");
      expect(response.body.data).toHaveProperty("completedGoals");
      expect(response.body.data).toHaveProperty("inProgressGoals");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/goals/stats");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
