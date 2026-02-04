import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import { GoalService } from "../../services/GoalService";
import { ApiError } from "../../utils/ApiError";
import { container } from "../../config/container";

describe("GoalService", () => {
  let goalService: GoalService;
  let testUser: any;
  let mockGoalRepository: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    // Mock repositories for testing
    mockGoalRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
    };

    mockNotificationService = {
      sendGoalReminder: jest.fn(),
      sendGoalAchieved: jest.fn(),
    };

    // Register mocks in container
    container.register("GoalRepository", { useValue: mockGoalRepository });
    container.register("NotificationService", {
      useValue: mockNotificationService,
    });

    goalService = new GoalService(mockGoalRepository, mockNotificationService);

    testUser = await TestDataFactory.createUser();
  });

  describe("createGoal", () => {
    it("should create a new goal", async () => {
      const goalData = {
        name: "Save for vacation",
        description: "Save money for summer vacation",
        targetAmount: 5000,
        currentAmount: 0,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        category: "savings" as const,
        priority: "medium" as const,
      };

      const mockGoal = {
        _id: new mongoose.Types.ObjectId(),
        name: goalData.name,
        description: goalData.description,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentAmount,
        startDate: goalData.startDate,
        targetDate: goalData.targetDate,
        category: goalData.category,
        priority: goalData.priority,
        user: testUser._id,
        isCompleted: false,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGoalRepository.create.mockResolvedValue(mockGoal);

      const result = await goalService.createGoal(
        testUser._id.toString(),
        goalData
      );

      expect(result).toHaveProperty("_id");
      expect(result.name).toBe(goalData.name);
      expect(result.targetAmount).toBe(goalData.targetAmount);
      expect(result.currentAmount).toBe(goalData.currentAmount);
    });

    it("should create goal with string dates", async () => {
      const goalData = {
        name: "Emergency Fund",
        description: "Build emergency fund",
        targetAmount: 10000,
        startDate: "2024-01-01",
        targetDate: "2024-12-31",
        category: "emergency" as const,
        priority: "high" as const,
      };

      const mockGoal = {
        _id: new mongoose.Types.ObjectId(),
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        currentAmount: 0,
        startDate: new Date(goalData.startDate),
        targetDate: new Date(goalData.targetDate),
        category: goalData.category,
        priority: goalData.priority,
        user: testUser._id,
        isCompleted: false,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGoalRepository.create.mockResolvedValue(mockGoal);

      const result = await goalService.createGoal(
        testUser._id.toString(),
        goalData
      );

      expect(result.name).toBe(goalData.name);
      expect(result.targetAmount).toBe(goalData.targetAmount);
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "",
        targetAmount: -100,
        targetDate: new Date(),
        category: "invalid_category" as any,
      };

      await expect(
        goalService.createGoal(testUser._id.toString(), invalidData)
      ).rejects.toThrow();
    });
  });

  describe("getGoalsByUserId", () => {
    it("should return all goals for user", async () => {
      const mockGoals = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Vacation Fund",
          targetAmount: 5000,
          currentAmount: 2000,
          user: testUser._id,
          isCompleted: false,
          progress: 40,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Emergency Fund",
          targetAmount: 10000,
          currentAmount: 10000,
          user: testUser._id,
          isCompleted: true,
          progress: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGoalRepository.findByUser.mockResolvedValue(mockGoals);

      const result = await goalService.getGoalsByUserId(
        testUser._id.toString()
      );

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Vacation Fund");
      expect(result[1].name).toBe("Emergency Fund");
    });

    it("should filter goals by category", async () => {
      const mockSavingsGoals = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "House Fund",
          category: "savings",
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGoalRepository.findByUser.mockResolvedValue(mockSavingsGoals);

      const result = await goalService.getGoalsByUserId(
        testUser._id.toString(),
        false
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("savings");
    });
  });

  describe("getGoalById", () => {
    it("should return goal by id", async () => {
      const goalId = new mongoose.Types.ObjectId().toString();
      const mockGoal = {
        _id: new mongoose.Types.ObjectId(goalId),
        name: "Test Goal",
        targetAmount: 1000,
        currentAmount: 500,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGoalRepository.findById.mockResolvedValue(mockGoal);

      const result = await goalService.getGoalById(
        goalId,
        testUser._id.toString()
      );

      expect(result._id.toString()).toBe(goalId);
      expect(result.name).toBe("Test Goal");
    });

    it("should throw error for non-existent goal", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockGoalRepository.findById.mockResolvedValue(null);

      await expect(
        goalService.getGoalById(fakeId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("updateGoal", () => {
    it("should update goal", async () => {
      const goalId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Goal",
        targetAmount: 2000,
      };

      const mockUpdatedGoal = {
        _id: new mongoose.Types.ObjectId(goalId),
        name: updateData.name,
        targetAmount: updateData.targetAmount,
        currentAmount: 1000,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGoalRepository.findById.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(goalId),
        user: testUser._id,
      });
      mockGoalRepository.update.mockResolvedValue(mockUpdatedGoal);

      const result = await goalService.updateGoal(
        goalId,
        testUser._id.toString(),
        updateData
      );

      expect(result.name).toBe(updateData.name);
      expect(result.targetAmount).toBe(updateData.targetAmount);
    });

    it("should throw error for non-existent goal", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Title" };

      mockGoalRepository.findById.mockResolvedValue(null);

      await expect(
        goalService.updateGoal(fakeId, testUser._id.toString(), updateData)
      ).rejects.toThrow(ApiError);
    });
  });

  describe("deleteGoal", () => {
    it("should delete goal", async () => {
      const goalId = new mongoose.Types.ObjectId().toString();

      mockGoalRepository.delete.mockResolvedValue(true);

      await expect(
        goalService.deleteGoal(goalId, testUser._id.toString())
      ).resolves.not.toThrow();
    });

    it("should throw error for non-existent goal", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockGoalRepository.delete.mockResolvedValue(false);

      await expect(
        goalService.deleteGoal(fakeId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("getGoalStats", () => {
    it("should return goal statistics", async () => {
      const mockGoals = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Goal 1",
          targetAmount: 1000,
          currentAmount: 500,
          isCompleted: false,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          user: testUser._id,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Goal 2",
          targetAmount: 2000,
          currentAmount: 2000,
          isCompleted: true,
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          user: testUser._id,
        },
      ];

      mockGoalRepository.findByUser.mockResolvedValue(mockGoals);

      const result = await goalService.getGoalStats(testUser._id.toString());

      expect(result.totalGoals).toBe(2);
      expect(result.completedGoals).toBe(1);
      expect(result.inProgressGoals).toBe(1);
    });
  });
});
