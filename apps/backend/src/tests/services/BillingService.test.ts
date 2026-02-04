import { BillingService } from "../../services/BillingService";
import { IPaymentService } from "../../interfaces/services/IPaymentService";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { ISubscriptionRepository } from "../../interfaces/repositories/ISubscriptionRepository";
import { IUser } from "../../interfaces/entities/IUser";
import { ISubscription } from "../../interfaces/entities/ISubscription";
import { ApiError } from "../../utils/ApiError";
import { TransactionManager } from "../../utils/TransactionManager";

// Mock dependencies
jest.mock("../../utils/TransactionManager");
jest.mock("mongoose", () => ({
  model: jest.fn(() => ({
    find: jest.fn(),
  })),
  Types: {
    ObjectId: jest.fn((id) => ({
      toString: () => id || "mock-object-id",
    })),
  },
}));

describe("BillingService", () => {
  let billingService: BillingService;
  let mockPaymentService: jest.Mocked<IPaymentService>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    // Create mocks
    mockPaymentService = {
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      listCustomerPaymentMethods: jest.fn(),
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
    } as any;

    mockSubscriptionRepository = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    } as any;

    // Create service instance
    billingService = new BillingService(
      mockPaymentService,
      mockUserRepository,
      mockSubscriptionRepository
    );

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("createCustomerForUser", () => {
    it("should create customer for user", async () => {
      const userId = "test-user-id";
      const mockUser: IUser = {
        _id: userId,
        email: "test@example.com",
        name: "Test User",
      } as unknown as IUser;

      const mockCustomer = { id: "cus_test123" };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockPaymentService.createCustomer.mockResolvedValue(mockCustomer as any);

      const result = await billingService.createCustomerForUser(userId);

      expect(result).toBe("cus_test123");
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockPaymentService.createCustomer).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name
      );
    });

    it("should return existing customer ID if user has subscription", async () => {
      const userId = "test-user-id";
      const mockUser: IUser = {
        _id: userId,
        email: "test@example.com",
        name: "Test User",
      } as unknown as IUser;

      const mockSubscription: ISubscription = {
        stripeCustomerId: "cus_existing123",
      } as ISubscription;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );

      const result = await billingService.createCustomerForUser(userId);

      expect(result).toBe("cus_existing123");
      expect(mockPaymentService.createCustomer).not.toHaveBeenCalled();
    });

    it("should throw error for non-existent user", async () => {
      const userId = "non-existent-user";

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        billingService.createCustomerForUser(userId)
      ).rejects.toThrow(ApiError);
      await expect(
        billingService.createCustomerForUser(userId)
      ).rejects.toThrow("Usuário não encontrado");
    });

    it("should update existing subscription with customer ID", async () => {
      const userId = "test-user-id";
      const mockUser: IUser = {
        _id: userId,
        email: "test@example.com",
        name: "Test User",
      } as unknown as IUser;

      const mockSubscription: ISubscription = {
        _id: { toString: () => "sub123" },
      } as ISubscription;

      const mockCustomer = { id: "cus_test123" };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );
      mockPaymentService.createCustomer.mockResolvedValue(mockCustomer as any);
      mockSubscriptionRepository.update.mockResolvedValue(mockSubscription);

      const result = await billingService.createCustomerForUser(userId);

      expect(result).toBe("cus_test123");
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(userId, {
        stripeCustomerId: "cus_test123",
      });
    });
  });

  describe("createCheckoutSession", () => {
    it("should create checkout session with new customer", async () => {
      const userId = "test-user-id";
      const options = {
        priceId: "price_test123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        metadata: { source: "test" },
      };

      const mockUser: IUser = {
        _id: userId,
        email: "test@example.com",
        name: "Test User",
      } as unknown as IUser;

      const mockCustomer = { id: "cus_test123" };
      const mockSession = { url: "https://checkout.stripe.com/test" };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockPaymentService.createCustomer.mockResolvedValue(mockCustomer as any);
      mockPaymentService.createCheckoutSession.mockResolvedValue(
        mockSession as any
      );
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      const result = await billingService.createCheckoutSession(
        userId,
        options
      );

      expect(result).toBe("https://checkout.stripe.com/test");
      expect(mockPaymentService.createCheckoutSession).toHaveBeenCalledWith({
        customerId: "cus_test123",
        priceId: options.priceId,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        metadata: {
          ...options.metadata,
          userId,
        },
      });
    });

    it("should create checkout session with existing customer", async () => {
      const userId = "test-user-id";
      const options = {
        priceId: "price_test123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        metadata: {},
      };

      const mockUser: IUser = {
        _id: userId,
        email: "test@example.com",
        name: "Test User",
      } as unknown as IUser;

      const mockSubscription: ISubscription = {
        stripeCustomerId: "cus_existing123",
      } as ISubscription;

      const mockSession = { url: "https://checkout.stripe.com/test" };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );
      mockPaymentService.createCheckoutSession.mockResolvedValue(
        mockSession as any
      );
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      const result = await billingService.createCheckoutSession(
        userId,
        options
      );

      expect(result).toBe("https://checkout.stripe.com/test");
      expect(mockPaymentService.createCheckoutSession).toHaveBeenCalledWith({
        customerId: "cus_existing123",
        priceId: options.priceId,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        metadata: {
          userId,
        },
      });
      expect(mockPaymentService.createCustomer).not.toHaveBeenCalled();
    });

    it("should throw error for non-existent user", async () => {
      const userId = "non-existent-user";
      const options = {
        priceId: "price_test123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        metadata: {},
      };

      mockUserRepository.findById.mockResolvedValue(null);
      (TransactionManager.executeInTransaction as jest.Mock).mockImplementation(
        (callback) => callback(null)
      );

      await expect(
        billingService.createCheckoutSession(userId, options)
      ).rejects.toThrow(ApiError);
      await expect(
        billingService.createCheckoutSession(userId, options)
      ).rejects.toThrow("Usuário não encontrado");
    });
  });

  describe("handleSubscriptionUpdated", () => {
    it("should handle subscription updated with active status", async () => {
      const stripeSubscriptionId = "sub_test123";
      const status = "active";

      const mockSubscription = {
        _id: { toString: () => "sub123" },
        user: "user123",
        planType: "PREMIUM" as any,
        status: "ACTIVE" as any,
        startDate: new Date(),
        endDate: new Date(),
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as ISubscription;

      const mockUpdatedSubscription = {
        _id: { toString: () => "sub123" },
        planType: "PREMIUM" as any,
        status: "ACTIVE" as any,
        startDate: new Date(),
        endDate: new Date(),
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMongoose = require("mongoose");
      const mockFind = jest.fn().mockResolvedValue([mockSubscription]);
      mockMongoose.model.mockReturnValue({ find: mockFind });
      mockSubscriptionRepository.update.mockResolvedValue(
        mockUpdatedSubscription as any
      );

      const result = await billingService.handleSubscriptionUpdated(
        stripeSubscriptionId,
        status
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe("ACTIVE");
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
        "user123",
        {
          status: "active" as any,
        }
      );
    });

    it("should handle subscription updated with canceled status", async () => {
      const stripeSubscriptionId = "sub_test123";
      const status = "canceled";

      const mockSubscription = {
        _id: { toString: () => "sub123" },
        user: "user123",
        planType: "PREMIUM" as any,
        status: "ACTIVE" as any,
        startDate: new Date(),
        endDate: new Date(),
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as ISubscription;

      const mockUpdatedSubscription = {
        ...mockSubscription,
        status: "CANCELED" as any,
      };

      const mockMongoose = require("mongoose");
      const mockFind = jest.fn().mockResolvedValue([mockSubscription]);
      mockMongoose.model.mockReturnValue({ find: mockFind });
      mockSubscriptionRepository.update.mockResolvedValue(
        mockUpdatedSubscription as any
      );

      const result = await billingService.handleSubscriptionUpdated(
        stripeSubscriptionId,
        status
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe("CANCELED");
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
        "user123",
        {
          status: "canceled" as any,
        }
      );
    });

    it("should handle subscription updated with expired status", async () => {
      const stripeSubscriptionId = "sub_test123";
      const status = "past_due";

      const mockSubscription = {
        _id: { toString: () => "sub123" },
        user: "user123",
        planType: "PREMIUM" as any,
        status: "ACTIVE" as any,
        startDate: new Date(),
        endDate: new Date(),
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as ISubscription;

      const mockUpdatedSubscription = {
        ...mockSubscription,
        status: "EXPIRED" as any,
      };

      const mockMongoose = require("mongoose");
      const mockFind = jest.fn().mockResolvedValue([mockSubscription]);
      mockMongoose.model.mockReturnValue({ find: mockFind });
      mockSubscriptionRepository.update.mockResolvedValue(
        mockUpdatedSubscription as any
      );

      const result = await billingService.handleSubscriptionUpdated(
        stripeSubscriptionId,
        status
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe("EXPIRED");
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
        "user123",
        {
          status: "expired" as any,
        }
      );
    });

    it("should return null if subscription not found", async () => {
      const stripeSubscriptionId = "sub_nonexistent";
      const status = "active";

      const mockMongoose = require("mongoose");
      mockMongoose.model().find.mockResolvedValue([]);

      const result = await billingService.handleSubscriptionUpdated(
        stripeSubscriptionId,
        status
      );

      expect(result).toBeNull();
      expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("handleSubscriptionDeleted", () => {
    it("should handle subscription deleted", async () => {
      const stripeSubscriptionId = "sub_test123";

      const mockSubscription = {
        _id: { toString: () => "sub123" },
        user: "user123",
        planType: "PREMIUM" as any,
        status: "ACTIVE" as any,
        startDate: new Date(),
        endDate: new Date(),
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as ISubscription;

      const mockUpdatedSubscription = {
        ...mockSubscription,
        status: "CANCELED" as any,
      };

      const mockMongoose = require("mongoose");
      const mockFind = jest.fn().mockResolvedValue([mockSubscription]);
      mockMongoose.model.mockReturnValue({ find: mockFind });
      mockSubscriptionRepository.update.mockResolvedValue(
        mockUpdatedSubscription as any
      );

      const result =
        await billingService.handleSubscriptionDeleted(stripeSubscriptionId);

      expect(result).toBeDefined();
      expect(result?.status).toBe("CANCELED");
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
        "user123",
        {
          status: "canceled" as any,
        }
      );
    });

    it("should return null if subscription not found", async () => {
      const stripeSubscriptionId = "sub_nonexistent";

      const mockMongoose = require("mongoose");
      mockMongoose.model().find.mockResolvedValue([]);

      const result =
        await billingService.handleSubscriptionDeleted(stripeSubscriptionId);

      expect(result).toBeNull();
      expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("handlePaymentSucceeded", () => {
    it("should handle payment succeeded", async () => {
      const paymentIntentId = "pi_test123";
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result =
        await billingService.handlePaymentSucceeded(paymentIntentId);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Payment succeeded: ${paymentIntentId}`
      );

      consoleSpy.mockRestore();
    });
  });

  describe("handlePaymentFailed", () => {
    it("should handle payment failed", async () => {
      const paymentIntentId = "pi_test123";
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await billingService.handlePaymentFailed(paymentIntentId);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Payment failed: ${paymentIntentId}`
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getCustomerPaymentMethods", () => {
    it("should return payment methods for user with subscription", async () => {
      const userId = "test-user-id";
      const mockSubscription: ISubscription = {
        stripeCustomerId: "cus_test123",
      } as ISubscription;

      const mockPaymentMethods = [
        { id: "pm_1", type: "card" },
        { id: "pm_2", type: "bank_account" },
      ];

      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );
      mockPaymentService.listCustomerPaymentMethods.mockResolvedValue(
        mockPaymentMethods
      );

      const result = await billingService.getCustomerPaymentMethods(userId);

      expect(result).toEqual(mockPaymentMethods);
      expect(
        mockPaymentService.listCustomerPaymentMethods
      ).toHaveBeenCalledWith("cus_test123");
    });

    it("should return empty array if user has no subscription", async () => {
      const userId = "test-user-id";

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await billingService.getCustomerPaymentMethods(userId);

      expect(result).toEqual([]);
      expect(
        mockPaymentService.listCustomerPaymentMethods
      ).not.toHaveBeenCalled();
    });

    it("should return empty array if subscription has no customer ID", async () => {
      const userId = "test-user-id";
      const mockSubscription: ISubscription = {
        stripeCustomerId: undefined,
      } as ISubscription;

      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );

      const result = await billingService.getCustomerPaymentMethods(userId);

      expect(result).toEqual([]);
      expect(
        mockPaymentService.listCustomerPaymentMethods
      ).not.toHaveBeenCalled();
    });

    it("should handle payment service errors gracefully", async () => {
      const userId = "test-user-id";
      const mockSubscription: ISubscription = {
        stripeCustomerId: "cus_test123",
      } as ISubscription;

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockSubscriptionRepository.findByUserId.mockResolvedValue(
        mockSubscription
      );
      mockPaymentService.listCustomerPaymentMethods.mockRejectedValue(
        new Error("Payment service error")
      );

      const result = await billingService.getCustomerPaymentMethods(userId);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching payment methods:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
