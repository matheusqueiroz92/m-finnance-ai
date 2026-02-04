import { SubscriptionRepository } from "../../repositories/SubscriptionRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import {
  SubscriptionStatus,
  SubscriptionPlanType,
} from "../../interfaces/entities/ISubscription";

describe("SubscriptionRepository", () => {
  let subscriptionRepository: SubscriptionRepository;
  let testUser: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    subscriptionRepository = new SubscriptionRepository();
    testUser = await TestDataFactory.createUser();
  });

  describe("create", () => {
    it("should create a new subscription", async () => {
      const subscriptionData = {
        user: testUser._id,
        planType: SubscriptionPlanType.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      const subscription =
        await subscriptionRepository.create(subscriptionData);

      expect(subscription).toBeDefined();
      expect(subscription.planType).toBe(SubscriptionPlanType.PREMIUM);
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(subscription.user.toString()).toBe(testUser._id.toString());
    });

    it("should create subscription with default values", async () => {
      const subscriptionData = {
        user: testUser._id,
        planType: SubscriptionPlanType.FREE,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const subscription =
        await subscriptionRepository.create(subscriptionData);

      expect(subscription).toBeDefined();
      expect(subscription.planType).toBe(SubscriptionPlanType.FREE);
    });

    it("should throw error for invalid data", async () => {
      const invalidData = {
        user: testUser._id,
        planType: "invalid", // Invalid: not in enum
        status: "invalid", // Invalid: not in enum
      };

      await expect(
        subscriptionRepository.create(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe("findByUserId", () => {
    it("should find subscription by user id", async () => {
      const subscription = await TestDataFactory.createSubscription(
        testUser._id
      );
      const foundSubscription = await subscriptionRepository.findByUserId(
        (testUser._id as any).toString()
      );

      expect(foundSubscription).toBeDefined();
      expect((foundSubscription?._id as any).toString()).toBe(
        (subscription._id as any).toString()
      );
      expect(foundSubscription?.user.toString()).toBe(testUser._id.toString());
    });

    it("should return null for user with no subscription", async () => {
      const foundSubscription = await subscriptionRepository.findByUserId(
        (testUser._id as any).toString()
      );

      expect(foundSubscription).toBeNull();
    });
  });

  describe("update", () => {
    it("should update subscription successfully", async () => {
      const subscription = await TestDataFactory.createSubscription(
        testUser._id
      );
      const updateData = {
        status: SubscriptionStatus.CANCELED,
        endDate: new Date(),
      };

      const updatedSubscription = await subscriptionRepository.update(
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedSubscription).toBeDefined();
      expect(updatedSubscription?.status).toBe(SubscriptionStatus.CANCELED);
    });

    it("should return null for user with no subscription", async () => {
      const updateData = { status: SubscriptionStatus.CANCELED };

      const updatedSubscription = await subscriptionRepository.update(
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedSubscription).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("should update subscription status successfully", async () => {
      const subscription = await TestDataFactory.createSubscription(
        testUser._id
      );

      const updatedSubscription = await subscriptionRepository.updateStatus(
        (testUser._id as any).toString(),
        SubscriptionStatus.CANCELED
      );

      expect(updatedSubscription).toBeDefined();
      expect(updatedSubscription?.status).toBe(SubscriptionStatus.CANCELED);
    });

    it("should return null for user with no subscription", async () => {
      const updatedSubscription = await subscriptionRepository.updateStatus(
        (testUser._id as any).toString(),
        SubscriptionStatus.CANCELED
      );

      expect(updatedSubscription).toBeNull();
    });
  });

  describe("checkActivePremium", () => {
    it("should return true for active premium subscription", async () => {
      await TestDataFactory.createSubscription(testUser._id, {
        planType: SubscriptionPlanType.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      const isActivePremium = await subscriptionRepository.checkActivePremium(
        (testUser._id as any).toString()
      );

      expect(isActivePremium).toBe(true);
    });

    it("should return true for trial premium subscription", async () => {
      await TestDataFactory.createSubscription(testUser._id, {
        planType: SubscriptionPlanType.PREMIUM,
        status: SubscriptionStatus.TRIAL,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      const isActivePremium = await subscriptionRepository.checkActivePremium(
        (testUser._id as any).toString()
      );

      expect(isActivePremium).toBe(true);
    });

    it("should return false for expired premium subscription", async () => {
      await TestDataFactory.createSubscription(testUser._id, {
        planType: SubscriptionPlanType.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      const isActivePremium = await subscriptionRepository.checkActivePremium(
        (testUser._id as any).toString()
      );

      expect(isActivePremium).toBe(false);
    });

    it("should return false for cancelled premium subscription", async () => {
      await TestDataFactory.createSubscription(testUser._id, {
        planType: SubscriptionPlanType.PREMIUM,
        status: SubscriptionStatus.CANCELED,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      const isActivePremium = await subscriptionRepository.checkActivePremium(
        (testUser._id as any).toString()
      );

      expect(isActivePremium).toBe(false);
    });

    it("should return false for free subscription", async () => {
      await TestDataFactory.createSubscription(testUser._id, {
        planType: SubscriptionPlanType.FREE,
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      const isActivePremium = await subscriptionRepository.checkActivePremium(
        (testUser._id as any).toString()
      );

      expect(isActivePremium).toBe(false);
    });

    it("should return false for user with no subscription", async () => {
      const isActivePremium = await subscriptionRepository.checkActivePremium(
        (testUser._id as any).toString()
      );

      expect(isActivePremium).toBe(false);
    });
  });

  describe("processExpiredSubscriptions", () => {
    it("should process expired subscriptions", async () => {
      await TestDataFactory.createSubscription(testUser._id, {
        status: SubscriptionStatus.ACTIVE,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      await subscriptionRepository.processExpiredSubscriptions();

      const subscription = await subscriptionRepository.findByUserId(
        (testUser._id as any).toString()
      );

      expect(subscription?.status).toBe(SubscriptionStatus.EXPIRED);
      expect(subscription?.planType).toBe(SubscriptionPlanType.FREE);
    });
  });
});
