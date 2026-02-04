import { GoalRepository } from "../../repositories/GoalRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import mongoose from "mongoose";

describe("GoalRepository", () => {
  let goalRepository: GoalRepository;
  let testUser: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    goalRepository = new GoalRepository();
    testUser = await TestDataFactory.createUser();
  });

  describe("create", () => {
    it("should create a new goal", async () => {
      const goalData = {
        name: "Emergency Fund",
        description: "Save for emergencies",
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: new Date("2024-12-31"),
        user: testUser._id,
      };

      const goal = await goalRepository.create(goalData);

      expect(goal).toBeDefined();
      expect(goal.name).toBe("Emergency Fund");
      expect(goal.targetAmount).toBe(10000);
      expect(goal.currentAmount).toBe(0);
      expect(goal.progress).toBe(0);
      expect(goal.isCompleted).toBe(false);
      expect(goal.user.toString()).toBe(testUser._id.toString());
    });

    it("should calculate progress automatically", async () => {
      const goalData = {
        name: "Vacation Fund",
        targetAmount: 5000,
        currentAmount: 2500,
        targetDate: new Date("2024-12-31"),
        user: testUser._id,
      };

      const goal = await goalRepository.create(goalData);

      expect(goal.progress).toBe(50);
      expect(goal.isCompleted).toBe(false);
    });

    it("should mark as completed when progress is 100%", async () => {
      const goalData = {
        name: "Completed Goal",
        targetAmount: 1000,
        currentAmount: 1000,
        targetDate: new Date("2024-12-31"),
        user: testUser._id,
      };

      const goal = await goalRepository.create(goalData);

      expect(goal.progress).toBe(100);
      expect(goal.isCompleted).toBe(true);
    });

    it("should cap progress at 100%", async () => {
      const goalData = {
        name: "Overfunded Goal",
        targetAmount: 1000,
        currentAmount: 1500,
        targetDate: new Date("2024-12-31"),
        user: testUser._id,
      };

      const goal = await goalRepository.create(goalData);

      expect(goal.progress).toBe(100);
      expect(goal.isCompleted).toBe(true);
    });

    it("should throw error for invalid data", async () => {
      const invalidData = {
        name: "", // Invalid: empty name
        targetAmount: -100, // Invalid: negative amount
        user: testUser._id,
      };

      await expect(goalRepository.create(invalidData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find goal by id", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id);
      const foundGoal = await goalRepository.findById(
        (goal._id as any).toString()
      );

      expect(foundGoal).toBeDefined();
      expect((foundGoal?._id as any).toString()).toBe(
        (goal._id as any).toString()
      );
      expect(foundGoal?.name).toBe(goal.name);
    });

    it("should find goal by id and user", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id);
      const foundGoal = await goalRepository.findById(
        (goal._id as any).toString(),
        testUser._id.toString()
      );

      expect(foundGoal).toBeDefined();
      expect((foundGoal?._id as any).toString()).toBe(
        (goal._id as any).toString()
      );
    });

    it("should return null for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const foundGoal = await goalRepository.findById(nonExistentId);

      expect(foundGoal).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const foundGoal = await goalRepository.findById("invalid-id");

      expect(foundGoal).toBeNull();
    });

    it("should return null for goal belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const goal = await TestDataFactory.createGoal(testUser._id);
      const foundGoal = await goalRepository.findById(
        (goal._id as any).toString(),
        (otherUser._id as any).toString()
      );

      expect(foundGoal).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find all goals for user", async () => {
      await TestDataFactory.createGoal(testUser._id, { name: "Goal 1" });
      await TestDataFactory.createGoal(testUser._id, { name: "Goal 2" });

      const goals = await goalRepository.findByUser(testUser._id.toString());

      expect(goals).toHaveLength(2);
      expect(goals[0].user.toString()).toBe(testUser._id.toString());
      expect(goals[1].user.toString()).toBe(testUser._id.toString());
    });

    it("should filter goals by completion status", async () => {
      await TestDataFactory.createGoal(testUser._id, { isCompleted: true });
      await TestDataFactory.createGoal(testUser._id, { isCompleted: false });

      const completedGoals = await goalRepository.findByUser(
        testUser._id.toString(),
        true
      );

      expect(completedGoals).toHaveLength(1);
      expect(completedGoals[0].isCompleted).toBe(true);
    });

    it("should return empty array for user with no goals", async () => {
      const goals = await goalRepository.findByUser(testUser._id.toString());

      expect(goals).toHaveLength(0);
    });

    it("should not return goals from other users", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      await TestDataFactory.createGoal(testUser._id);
      await TestDataFactory.createGoal((otherUser._id as any).toString());

      const goals = await goalRepository.findByUser(testUser._id.toString());

      expect(goals).toHaveLength(1);
      expect(goals[0].user.toString()).toBe(testUser._id.toString());
    });
  });

  describe("update", () => {
    it("should update goal successfully", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id);
      const updateData = {
        name: "Updated Goal",
        currentAmount: 5000,
      };

      const updatedGoal = await goalRepository.update(
        (goal._id as any).toString(),
        testUser._id.toString(),
        updateData
      );

      expect(updatedGoal).toBeDefined();
      expect(updatedGoal?.name).toBe("Updated Goal");
      expect(updatedGoal?.currentAmount).toBe(5000);
    });

    it("should recalculate progress on update", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        targetAmount: 10000,
        currentAmount: 0,
      });

      const updateData = { currentAmount: 5000 };

      const updatedGoal = await goalRepository.update(
        (goal._id as any).toString(),
        testUser._id.toString(),
        updateData
      );

      expect(updatedGoal?.progress).toBe(50);
      expect(updatedGoal?.isCompleted).toBe(false);
    });

    it("should return null for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Goal" };

      const updatedGoal = await goalRepository.update(
        nonExistentId,
        testUser._id.toString(),
        updateData
      );

      expect(updatedGoal).toBeNull();
    });

    it("should return null for goal belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const goal = await TestDataFactory.createGoal(testUser._id);
      const updateData = { name: "Updated Goal" };

      const updatedGoal = await goalRepository.update(
        (goal._id as any).toString(),
        (otherUser._id as any).toString(),
        updateData
      );

      expect(updatedGoal).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const updateData = { name: "Updated Goal" };

      const updatedGoal = await goalRepository.update(
        "invalid-id",
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedGoal).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete goal successfully", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id);

      const result = await goalRepository.delete(
        (goal._id as any).toString(),
        testUser._id.toString()
      );

      expect(result).toBe(true);

      // Verify goal is deleted
      const deletedGoal = await goalRepository.findById(
        (goal._id as any).toString()
      );
      expect(deletedGoal).toBeNull();
    });

    it("should return false for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await goalRepository.delete(
        nonExistentId,
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });

    it("should return false for goal belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const goal = await TestDataFactory.createGoal(testUser._id);

      const result = await goalRepository.delete(
        (goal._id as any).toString(),
        (otherUser._id as any).toString()
      );

      expect(result).toBe(false);

      // Verify goal still exists
      const existingGoal = await goalRepository.findById(
        (goal._id as any).toString()
      );
      expect(existingGoal).toBeDefined();
    });

    it("should return false for invalid id", async () => {
      const result = await goalRepository.delete(
        "invalid-id",
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });
  });

  describe("calculateProgress", () => {
    it("should calculate progress correctly", async () => {
      const goal = await TestDataFactory.createGoal(testUser._id, {
        targetAmount: 10000,
        currentAmount: 0,
      });

      const progress = await goalRepository.calculateProgress(
        (goal._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(progress).toBe(0);
    });

    it("should throw error for non-existent goal", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      await expect(
        goalRepository.calculateProgress(
          nonExistentId,
          (testUser._id as any).toString()
        )
      ).rejects.toThrow("Meta não encontrada");
    });
  });
});
