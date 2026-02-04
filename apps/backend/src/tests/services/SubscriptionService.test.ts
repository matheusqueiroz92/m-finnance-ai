import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import { SubscriptionService } from "../../services/SubscriptionService";
import { ApiError } from "../../utils/ApiError";
import { container } from "../../config/container";

describe("SubscriptionService", () => {
  let subscriptionService: SubscriptionService;
  let testUser: any;
  let mockSubscriptionRepository: any;

  beforeEach(async () => {
    // Mock repositories for testing
    mockSubscriptionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findExpiringSoon: jest.fn(),
    };

    // Register mocks in container
    container.register("SubscriptionRepository", {
      useValue: mockSubscriptionRepository,
    });

    subscriptionService = new SubscriptionService(mockSubscriptionRepository);

    testUser = await TestDataFactory.createUser();
  });

  describe("createSubscription", () => {
    it("should create a new subscription", async () => {
      const subscriptionData = {
        planType: "premium" as const,
        status: "active" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        price: 29.99,
        paymentMethod: "credit_card",
      };

      const mockSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: subscriptionData.planType,
        status: subscriptionData.status,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        price: subscriptionData.price,
        paymentMethod: subscriptionData.paymentMethod,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(mockSubscription);

      const result = await subscriptionService.createSubscription(
        testUser._id.toString(),
        subscriptionData
      );

      expect(result).toHaveProperty("_id");
      expect(result.planType).toBe(subscriptionData.planType);
      expect(result.status).toBe(subscriptionData.status);
    });

    it("should create subscription with default dates", async () => {
      const subscriptionData = {
        planType: "premium" as const,
        status: "active" as const,
        price: 29.99,
        paymentMethod: "credit_card",
      };

      const mockSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: subscriptionData.planType,
        status: subscriptionData.status,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price: subscriptionData.price,
        paymentMethod: subscriptionData.paymentMethod,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(mockSubscription);

      const result = await subscriptionService.createSubscription(
        testUser._id.toString(),
        subscriptionData
      );

      expect(result.planType).toBe(subscriptionData.planType);
      expect(result.status).toBe(subscriptionData.status);
    });

    it("should throw error if user already has subscription", async () => {
      const subscriptionData = {
        planType: "premium" as const,
        status: "active" as const,
        price: 29.99,
        paymentMethod: "credit_card",
      };

      const existingSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: "basic",
        status: "active",
        user: testUser._id,
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        existingSubscription
      );

      await expect(
        subscriptionService.createSubscription(
          testUser._id.toString(),
          subscriptionData
        )
      ).rejects.toThrow(ApiError);
    });

    it("should validate required fields", async () => {
      const invalidData = {
        planType: "invalid_plan" as any,
        status: "invalid_status" as any,
        price: -10,
      };

      await expect(
        subscriptionService.createSubscription(
          testUser._id.toString(),
          invalidData
        )
      ).rejects.toThrow();
    });
  });

  describe("getUserSubscription", () => {
    it("should return subscription for user", async () => {
      const mockSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: "premium",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        price: 29.99,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );

      const result = await subscriptionService.getUserSubscription(
        testUser._id.toString()
      );

      expect(result).toHaveProperty("_id");
      expect(result.planType).toBe("premium");
      expect(result.status).toBe("active");
    });

    it("should return null if no subscription found", async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await subscriptionService.getUserSubscription(
        testUser._id.toString()
      );

      expect(result).toBeNull();
    });
  });

  describe("updateSubscription", () => {
    it("should update subscription", async () => {
      const updateData = {
        planType: "enterprise" as const,
        price: 99.99,
      };

      const mockUpdatedSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: updateData.planType,
        status: "active",
        price: updateData.price,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        user: testUser._id,
      });
      mockSubscriptionRepository.update.mockResolvedValue(
        mockUpdatedSubscription
      );

      const result = await subscriptionService.updateSubscription(
        testUser._id.toString(),
        updateData
      );

      expect(result.planType).toBe(updateData.planType);
    });

    it("should throw error for non-existent subscription", async () => {
      const updateData = { planType: "premium" as const };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      await expect(
        subscriptionService.updateSubscription(
          testUser._id.toString(),
          updateData
        )
      ).rejects.toThrow(ApiError);
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription", async () => {
      const mockCancelledSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: "premium",
        status: "cancelled",
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        user: testUser._id,
        status: "active",
      });
      mockSubscriptionRepository.update.mockResolvedValue(
        mockCancelledSubscription
      );

      const result = await subscriptionService.cancelSubscription(
        testUser._id.toString()
      );

      expect(result.status).toBe("cancelled");
    });

    it("should throw error for non-existent subscription", async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      await expect(
        subscriptionService.cancelSubscription(testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("createTrialSubscription", () => {
    it("should create trial subscription", async () => {
      const mockTrialSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: "trial",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        price: 0,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockResolvedValue(
        mockTrialSubscription
      );

      const result = await subscriptionService.createTrialSubscription(
        testUser._id.toString()
      );

      expect(result.planType).toBe("trial");
      expect(result.status).toBe("active");
    });

    it("should throw error if user already has subscription", async () => {
      const existingSubscription = {
        _id: new mongoose.Types.ObjectId(),
        planType: "premium",
        status: "active",
        user: testUser._id,
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        existingSubscription
      );

      await expect(
        subscriptionService.createTrialSubscription(testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });
});
