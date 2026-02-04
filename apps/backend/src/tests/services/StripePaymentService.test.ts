import { StripePaymentService } from "../../services/StripePaymentService";
import { container } from "../../config/container";

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      confirm: jest.fn(),
    },
    paymentMethods: {
      create: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn(),
      detach: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

describe("StripePaymentService", () => {
  let stripePaymentService: StripePaymentService;
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variable
    process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";

    // Mock Stripe instance
    mockStripe = {
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        del: jest.fn(),
      },
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        confirm: jest.fn(),
      },
      paymentMethods: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
        detach: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    stripePaymentService = new StripePaymentService();
    // Inject mock stripe instance
    (stripePaymentService as any).stripe = mockStripe;
  });

  describe("createCustomer", () => {
    it("should create a new customer", async () => {
      const email = "test@example.com";
      const name = "Test User";

      const mockCustomer = {
        id: "cus_test123",
        email,
        name,
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const result = await stripePaymentService.createCustomer(email, name);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({ email, name });
      expect(result).toEqual({
        id: "cus_test123",
        email,
        name,
      });
    });

    it("should handle customer creation errors", async () => {
      const email = "invalid-email";
      const name = "Test User";

      const error = new Error("Invalid email");
      mockStripe.customers.create.mockRejectedValue(error);

      await expect(
        stripePaymentService.createCustomer(email, name)
      ).rejects.toThrow("Invalid email");
    });
  });

  describe("retrieveCustomer", () => {
    it("should retrieve a customer by ID", async () => {
      const customerId = "cus_test123";
      const mockCustomer = {
        id: customerId,
        email: "test@example.com",
        name: "Test User",
        deleted: false,
      };

      mockStripe.customers.retrieve.mockResolvedValue(mockCustomer);

      const result = await stripePaymentService.retrieveCustomer(customerId);

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith(customerId);
      expect(result).toEqual({
        id: customerId,
        email: "test@example.com",
        name: "Test User",
      });
    });

    it("should handle customer not found", async () => {
      const customerId = "cus_nonexistent";
      const error = new Error("Customer not found");
      mockStripe.customers.retrieve.mockRejectedValue(error);

      await expect(
        stripePaymentService.retrieveCustomer(customerId)
      ).rejects.toThrow("Customer not found");
    });

    it("should handle deleted customer", async () => {
      const customerId = "cus_deleted";
      const mockCustomer = {
        id: customerId,
        deleted: true,
      };

      mockStripe.customers.retrieve.mockResolvedValue(mockCustomer);

      await expect(
        stripePaymentService.retrieveCustomer(customerId)
      ).rejects.toThrow("Customer has been deleted");
    });
  });

  describe("createPaymentIntent", () => {
    it("should create a payment intent", async () => {
      const options = {
        amount: 2000,
        currency: "usd" as const,
        customerId: "cus_test123",
        metadata: { orderId: "order123" },
      };

      const mockPaymentIntent = {
        id: "pi_test123",
        amount: options.amount,
        currency: options.currency,
        status: "requires_payment_method",
        client_secret: "pi_test123_secret",
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripePaymentService.createPaymentIntent(options);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: options.amount,
        currency: options.currency,
        customer: options.customerId,
        metadata: options.metadata,
      });
      expect(result).toEqual({
        id: "pi_test123",
        amount: 2000,
        currency: "usd",
        status: "requires_payment_method",
        clientSecret: "pi_test123_secret",
      });
    });

    it("should create payment intent without customer", async () => {
      const options = {
        amount: 2000,
        currency: "usd" as const,
      };

      const mockPaymentIntent = {
        id: "pi_test123",
        amount: options.amount,
        currency: options.currency,
        status: "requires_payment_method",
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripePaymentService.createPaymentIntent(options);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: options.amount,
        currency: options.currency,
      });
      expect(result.clientSecret).toBeUndefined();
    });
  });

  describe("retrievePaymentIntent", () => {
    it("should retrieve a payment intent", async () => {
      const paymentIntentId = "pi_test123";
      const mockPaymentIntent = {
        id: paymentIntentId,
        amount: 2000,
        currency: "usd",
        status: "succeeded",
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result =
        await stripePaymentService.retrievePaymentIntent(paymentIntentId);

      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(
        paymentIntentId
      );
      expect(result).toEqual({
        id: paymentIntentId,
        amount: 2000,
        currency: "usd",
        status: "succeeded",
      });
    });
  });

  describe("createCheckoutSession", () => {
    it("should create a checkout session", async () => {
      const options = {
        customerId: "cus_test123",
        priceId: "price_test123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        metadata: { userId: "user123" },
      };

      const mockSession = {
        id: "cs_test123",
        url: "https://checkout.stripe.com/test123",
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await stripePaymentService.createCheckoutSession(options);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer: options.customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: options.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        metadata: options.metadata,
      });
      expect(result).toEqual({
        id: "cs_test123",
        url: "https://checkout.stripe.com/test123",
      });
    });
  });

  describe("listCustomerPaymentMethods", () => {
    it("should list payment methods for a customer", async () => {
      const customerId = "cus_test123";
      const mockPaymentMethods = {
        data: [
          {
            id: "pm_test123",
            type: "card",
            card: {
              brand: "visa",
              last4: "4242",
              exp_month: 12,
              exp_year: 2025,
            },
          },
        ],
      };

      mockStripe.paymentMethods.list.mockResolvedValue(mockPaymentMethods);

      const result =
        await stripePaymentService.listCustomerPaymentMethods(customerId);

      expect(mockStripe.paymentMethods.list).toHaveBeenCalledWith({
        customer: customerId,
        type: "card",
      });
      expect(result).toEqual([
        {
          id: "pm_test123",
          type: "card",
          brand: "visa",
          last4: "4242",
          expiryMonth: 12,
          expiryYear: 2025,
        },
      ]);
    });
  });

  describe("validateWebhookEvent", () => {
    it("should validate webhook event", async () => {
      const payload = { test: "data" };
      const signature = "test_signature";

      const mockEvent = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test123",
            amount: 2000,
          },
        },
      };

      // Mock webhook construction
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = await stripePaymentService.validateWebhookEvent(
        payload,
        signature
      );

      expect(result).toEqual({
        type: "payment_intent.succeeded",
        data: {
          id: "pi_test123",
          amount: 2000,
        },
      });
    });

    it("should handle webhook validation errors", async () => {
      const payload = { test: "data" };
      const signature = "invalid_signature";

      const error = new Error("Invalid signature");
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw error;
      });

      await expect(
        stripePaymentService.validateWebhookEvent(payload, signature)
      ).rejects.toThrow("Webhook Error: Invalid signature");
    });
  });
});
