import mongoose from "mongoose";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import { CategoryService } from "../../services/CategoryService";
import { ApiError } from "../../utils/ApiError";
import { container } from "../../config/container";

describe("CategoryService", () => {
  let categoryService: CategoryService;
  let testUser: any;
  let mockCategoryRepository: any;
  let mockTransactionRepository: any;

  beforeEach(async () => {
    // Mock repositories for testing
    mockCategoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTransactionRepository = {
      findByCategory: jest.fn(),
    };

    // Register mocks in container
    container.register("CategoryRepository", {
      useValue: mockCategoryRepository,
    });
    container.register("TransactionRepository", {
      useValue: mockTransactionRepository,
    });

    categoryService = new CategoryService(
      mockCategoryRepository,
      mockTransactionRepository
    );

    testUser = await TestDataFactory.createUser();
  });

  describe("createCategory", () => {
    it("should create a new category", async () => {
      const categoryData = {
        name: "Food",
        type: "expense" as const,
        color: "#FF5733",
        icon: "🍔",
        isDefault: false,
      };

      const mockCategory = {
        _id: new mongoose.Types.ObjectId(),
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        icon: categoryData.icon,
        isDefault: categoryData.isDefault,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory(
        testUser._id.toString(),
        categoryData
      );

      expect(result).toHaveProperty("_id");
      expect(result.name).toBe(categoryData.name);
      expect(result.type).toBe(categoryData.type);
      expect(result.color).toBe(categoryData.color);
      expect(result.icon).toBe(categoryData.icon);
    });

    it("should create default category", async () => {
      const categoryData = {
        name: "Default Category",
        type: "expense" as const,
        color: "#000000",
        isDefault: true,
      };

      const mockCategory = {
        _id: new mongoose.Types.ObjectId(),
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color,
        isDefault: true,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory(
        testUser._id.toString(),
        categoryData
      );

      expect(result.isDefault).toBe(true);
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "",
        type: "invalid_type" as any,
      };

      await expect(
        categoryService.createCategory(testUser._id.toString(), invalidData)
      ).rejects.toThrow();
    });
  });

  describe("getCategoriesByUserId", () => {
    it("should return all categories for user", async () => {
      const mockCategories = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Food",
          type: "expense",
          color: "#FF5733",
          icon: "🍔",
          isDefault: false,
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Salary",
          type: "income",
          color: "#00FF00",
          icon: "💰",
          isDefault: false,
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCategoryRepository.findByUser.mockResolvedValue(mockCategories);

      const result = await categoryService.getCategoriesByUserId(
        testUser._id.toString()
      );

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Food");
      expect(result[1].name).toBe("Salary");
    });

    it("should filter categories by type", async () => {
      const mockExpenseCategories = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Food",
          type: "expense",
          color: "#FF5733",
          user: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCategoryRepository.findByUser.mockResolvedValue(
        mockExpenseCategories
      );

      const result = await categoryService.getCategoriesByUserId(
        testUser._id.toString(),
        "expense"
      );

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("expense");
    });
  });

  describe("getCategoryById", () => {
    it("should return category by id", async () => {
      const categoryId = new mongoose.Types.ObjectId().toString();
      const mockCategory = {
        _id: new mongoose.Types.ObjectId(categoryId),
        name: "Test Category",
        type: "expense",
        color: "#FF5733",
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryById(
        categoryId,
        testUser._id.toString()
      );

      expect(result._id.toString()).toBe(categoryId);
      expect(result.name).toBe("Test Category");
    });

    it("should throw error for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        categoryService.getCategoryById(fakeId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("updateCategory", () => {
    it("should update category", async () => {
      const categoryId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: "Updated Category",
        color: "#00FF00",
      };

      const mockUpdatedCategory = {
        _id: new mongoose.Types.ObjectId(categoryId),
        name: updateData.name,
        type: "expense",
        color: updateData.color,
        user: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findById.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(categoryId),
        user: testUser._id,
      });
      mockCategoryRepository.update.mockResolvedValue(mockUpdatedCategory);

      const result = await categoryService.updateCategory(
        categoryId,
        testUser._id.toString(),
        updateData
      );

      expect(result.name).toBe(updateData.name);
      expect(result.color).toBe(updateData.color);
    });

    it("should throw error for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Name" };

      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        categoryService.updateCategory(
          fakeId,
          testUser._id.toString(),
          updateData
        )
      ).rejects.toThrow(ApiError);
    });
  });

  describe("deleteCategory", () => {
    it("should delete category", async () => {
      const categoryId = new mongoose.Types.ObjectId().toString();

      mockTransactionRepository.findByCategory.mockResolvedValue([]);
      mockCategoryRepository.delete.mockResolvedValue(true);

      await expect(
        categoryService.deleteCategory(categoryId, testUser._id.toString())
      ).resolves.not.toThrow();
    });

    it("should throw error if category has transactions", async () => {
      const categoryId = new mongoose.Types.ObjectId().toString();

      mockTransactionRepository.findByCategory.mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), amount: 100 },
      ]);

      await expect(
        categoryService.deleteCategory(categoryId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });

    it("should throw error for non-existent category", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      mockTransactionRepository.findByCategory.mockResolvedValue([]);
      mockCategoryRepository.delete.mockResolvedValue(false);

      await expect(
        categoryService.deleteCategory(fakeId, testUser._id.toString())
      ).rejects.toThrow(ApiError);
    });
  });

  describe("createDefaultCategories", () => {
    it("should create default categories for user", async () => {
      mockCategoryRepository.createDefaultCategories = jest
        .fn()
        .mockResolvedValue(undefined);

      await expect(
        categoryService.createDefaultCategories(testUser._id.toString())
      ).resolves.not.toThrow();

      expect(
        mockCategoryRepository.createDefaultCategories
      ).toHaveBeenCalledWith(testUser._id.toString());
    });
  });
});
