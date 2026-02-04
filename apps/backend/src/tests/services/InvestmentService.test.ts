import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import { InvestmentService } from "../../services/InvestmentService";
import { ApiError } from "../../utils/ApiError";
import { container } from "../../config/container";

describe("InvestmentService", () => {
  let investmentService: InvestmentService;
  let testUser: any;
  let mockInvestmentRepository: any;
  let mockAccountRepository: any;

  beforeEach(async () => {
    // Mock repositories for testing
    mockInvestmentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      countByUser: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getSummary: jest.fn(),
    };

    mockAccountRepository = {
      findById: jest.fn(),
    };

    // Register mocks in container
    container.register("InvestmentRepository", {
      useValue: mockInvestmentRepository,
    });
    container.register("AccountRepository", {
      useValue: mockAccountRepository,
    });

    investmentService = new InvestmentService(
      mockInvestmentRepository,
      mockAccountRepository
    );

    testUser = await TestDataFactory.createUser();
  });

  describe("createInvestment", () => {
    it("should create a new investment", async () => {
      const investmentData = {
        name: "Apple Stock",
        type: "stock" as const,
        symbol: "AAPL",
        initialValue: 1000,
        currentValue: 1200,
        quantity: 10,
        amount: 10,
        account: testUser._id.toString(),
        acquisitionDate: new Date(),
        description: "Apple Inc. stock investment",
      };

      const mockInvestment = {
        _id: new mongoose.Types.ObjectId(),
        name: investmentData.name,
        type: investmentData.type,
        symbol: investmentData.symbol,
        initialValue: investmentData.initialValue,
        currentValue: investmentData.currentValue,
        quantity: investmentData.quantity,
        account: testUser._id,
        user: testUser._id,
        acquisitionDate: investmentData.acquisitionDate,
        description: investmentData.description,
        absoluteReturn: 200,
        percentageReturn: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue({
        _id: testUser._id,
        name: "Investment Account",
        type: "investment",
        user: testUser._id,
      });
      mockInvestmentRepository.create.mockResolvedValue(mockInvestment);

      const result = await investmentService.createInvestment(
        testUser._id.toString(),
        investmentData
      );

      expect(result).toHaveProperty("_id");
      expect(result.name).toBe(investmentData.name);
      expect(result.type).toBe(investmentData.type);
      expect(result.symbol).toBe(investmentData.symbol);
      expect(result.initialValue).toBe(investmentData.initialValue);
      expect(result.currentValue).toBe(investmentData.currentValue);
    });

    it("should create investment with string date", async () => {
      const investmentData = {
        name: "Tesla Stock",
        type: "stock" as const,
        symbol: "TSLA",
        initialValue: 500,
        currentValue: 600,
        quantity: 5,
        amount: 5,
        account: testUser._id.toString(),
        acquisitionDate: "2024-01-01",
        description: "Tesla Inc. stock investment",
      };

      const mockInvestment = {
        _id: new mongoose.Types.ObjectId(),
        name: investmentData.name,
        type: investmentData.type,
        symbol: investmentData.symbol,
        initialValue: investmentData.initialValue,
        currentValue: investmentData.currentValue,
        quantity: investmentData.quantity,
        account: testUser._id,
        user: testUser._id,
        acquisitionDate: new Date(investmentData.acquisitionDate),
        description: investmentData.description,
        absoluteReturn: 100,
        percentageReturn: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue({
        _id: testUser._id,
        name: "Investment Account",
        type: "investment",
        user: testUser._id,
      });
      mockInvestmentRepository.create.mockResolvedValue(mockInvestment);

      const result = await investmentService.createInvestment(
        testUser._id.toString(),
        investmentData
      );

      expect(result.name).toBe(investmentData.name);
      expect(result.acquisitionDate).toEqual(
        new Date(investmentData.acquisitionDate)
      );
    });

    it("should throw error for non-existent account", async () => {
      const investmentData = {
        name: "Test Investment",
        type: "stock" as const,
        initialValue: 1000,
        currentValue: 1200,
        quantity: 10,
        amount: 10,
        account: "invalid_account_id",
        acquisitionDate: new Date(),
      };

      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(
        investmentService.createInvestment(
          testUser._id.toString(),
          investmentData
        )
      ).rejects.toThrow(ApiError);
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "",
        type: "invalid_type" as any,
        initialValue: -100,
        amount: 10,
        currentValue: 100,
        acquisitionDate: new Date(),
        account: testUser._id.toString(),
      };

      await expect(
        investmentService.createInvestment(testUser._id.toString(), invalidData)
      ).rejects.toThrow();
    });
  });

  describe("getInvestmentsByUserId", () => {
    it("should return all investments for user", async () => {
      const mockInvestments = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Apple Stock",
          type: "stock",
          symbol: "AAPL",
          initialValue: 1000,
          currentValue: 1200,
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Tesla Stock",
          type: "stock",
          symbol: "TSLA",
          initialValue: 500,
          currentValue: 600,
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInvestmentRepository.findByUser.mockResolvedValue(mockInvestments);
      mockInvestmentRepository.countByUser.mockResolvedValue(2);

      const result = await investmentService.getInvestmentsByUserId(
        testUser._id.toString(),
        { page: 1, limit: 10 }
      );

      expect(result.investments).toHaveLength(2);
      expect(result.investments[0].name).toBe("Apple Stock");
      expect(result.investments[1].name).toBe("Tesla Stock");
      expect(result.total).toBe(2);
    });

    it("should filter investments by type", async () => {
      const mockStockInvestments = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Apple Stock",
          type: "stock",
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInvestmentRepository.findByUser.mockResolvedValue(
        mockStockInvestments
      );
      mockInvestmentRepository.countByUser.mockResolvedValue(1);

      const result = await investmentService.getInvestmentsByUserId(
        testUser._id.toString(),
        { type: "stock", page: 1, limit: 10 }
      );

      expect(result.investments).toHaveLength(1);
      expect(result.investments[0].type).toBe("stock");
    });
  });

  describe("getInvestmentById", () => {
    it("should return investment by id", async () => {
      const investmentId = new mongoose.Types.ObjectId().toString();
      const mockInvestment = {
        _id: new mongoose.Types.ObjectId(investmentId),
        name: "Test Investment",
        type: "stock",
        initialValue: 1000,
        currentValue: 1200,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvestmentRepository.findById.mockResolvedValue(mockInvestment);

      const result = await investmentService.getInvestmentById(
        investmentId,
        testUser._id.toString()
      );

      expect(result._id.toString()).toBe(investmentId);
      expect(result.name).toBe("Test Investment");
    });

    it("should throw error for non-existent investment", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockInvestmentRepository.findById.mockResolvedValue(null);

      await expect(
        investmentService.getInvestmentById(fakeId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("updateInvestment", () => {
    it("should update investment", async () => {
      const investmentId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Investment",
        currentValue: 1500,
      };

      const mockUpdatedInvestment = {
        _id: new mongoose.Types.ObjectId(investmentId),
        name: updateData.name,
        type: "stock",
        initialValue: 1000,
        currentValue: updateData.currentValue,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvestmentRepository.findById.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(investmentId),
        user: testUser._id,
      });
      mockInvestmentRepository.update.mockResolvedValue(mockUpdatedInvestment);

      const result = await investmentService.updateInvestment(
        investmentId,
        testUser._id.toString(),
        updateData
      );

      expect(result.name).toBe(updateData.name);
      expect(result.currentValue).toBe(updateData.currentValue);
    });

    it("should throw error for non-existent investment", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Name" };

      mockInvestmentRepository.findById.mockResolvedValue(null);

      await expect(
        investmentService.updateInvestment(
          fakeId,
          testUser._id.toString(),
          updateData
        )
      ).rejects.toThrow(ApiError);
    });
  });

  describe("deleteInvestment", () => {
    it("should delete investment", async () => {
      const investmentId = new mongoose.Types.ObjectId().toString();

      mockInvestmentRepository.findById.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(investmentId),
        user: testUser._id,
      });
      mockInvestmentRepository.delete.mockResolvedValue(true);

      await expect(
        investmentService.deleteInvestment(
          investmentId,
          testUser._id.toString()
        )
      ).resolves.not.toThrow();
    });

    it("should throw error for non-existent investment", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockInvestmentRepository.findById.mockResolvedValue(null);

      await expect(
        investmentService.deleteInvestment(fakeId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("getInvestmentSummary", () => {
    it("should return investment summary", async () => {
      const mockSummary = {
        totalInvestments: 5,
        totalInitialValue: 10000,
        totalCurrentValue: 12000,
        totalReturn: 2000,
        totalReturnPercentage: 20,
        bestPerformer: {
          name: "Apple Stock",
          returnPercentage: 25,
        },
        worstPerformer: {
          name: "Tesla Stock",
          returnPercentage: -5,
        },
        byType: {
          stock: { count: 3, totalValue: 8000 },
          bond: { count: 2, totalValue: 4000 },
        },
      };

      const mockInvestments = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Apple Stock",
          type: "stock",
          initialValue: 1000,
          currentValue: 1200,
          user: testUser._id,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Tesla Stock",
          type: "stock",
          initialValue: 500,
          currentValue: 600,
          user: testUser._id,
        },
      ];

      mockInvestmentRepository.findByUser.mockResolvedValue(mockInvestments);

      const result = await investmentService.getInvestmentSummary(
        testUser._id.toString()
      );

      expect(result.totalInvested).toBe(1500);
      expect(result.totalCurrentValue).toBe(1800);
      expect(result.totalReturn.value).toBe(300);
      expect(result.totalReturn.percentage).toBe(20);
    });
  });
});
