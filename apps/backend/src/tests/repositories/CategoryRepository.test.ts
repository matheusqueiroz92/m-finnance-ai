import { CategoryRepository } from "../../repositories/CategoryRepository";
import { TestDatabase, TestDataFactory } from "../utils/testHelpers";
import mongoose from "mongoose";

describe("CategoryRepository", () => {
  let categoryRepository: CategoryRepository;
  let testUser: any;

  beforeAll(async () => {
    await TestDatabase.setup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
    categoryRepository = new CategoryRepository();
    testUser = await TestDataFactory.createUser();
  });

  describe("create", () => {
    it("should create a new category", async () => {
      const categoryData = {
        name: "Food",
        type: "expense" as const,
        color: "#FF5733",
        icon: "🍔",
        user: testUser._id,
      };

      const category = await categoryRepository.create(categoryData);

      expect(category).toBeDefined();
      expect(category.name).toBe("Food");
      expect(category.type).toBe("expense");
      expect(category.color).toBe("#FF5733");
      expect(category.icon).toBe("🍔");
      expect(category.user.toString()).toBe(testUser._id.toString());
    });

    it("should create category with default values", async () => {
      const categoryData = {
        name: "Salary",
        type: "income" as const,
        user: testUser._id,
      };

      const category = await categoryRepository.create(categoryData);

      expect(category).toBeDefined();
      expect(category.name).toBe("Salary");
      expect(category.type).toBe("income");
      expect(category.isDefault).toBe(false); // Default value
    });

    it("should throw error for invalid data", async () => {
      const invalidData = {
        name: "", // Invalid: empty name
        type: "invalid" as any, // Invalid: not in enum
        user: testUser._id,
      };

      await expect(categoryRepository.create(invalidData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find category by id", async () => {
      const category = await TestDataFactory.createCategory(testUser._id);
      const foundCategory = await categoryRepository.findById(
        (category._id as any).toString()
      );

      expect(foundCategory).toBeDefined();
      expect((foundCategory?._id as any).toString()).toBe(
        (category._id as any).toString()
      );
      expect(foundCategory?.name).toBe(category.name);
    });

    it("should find category by id and user", async () => {
      const category = await TestDataFactory.createCategory(testUser._id);
      const foundCategory = await categoryRepository.findById(
        (category._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(foundCategory).toBeDefined();
      expect((foundCategory?._id as any).toString()).toBe(
        (category._id as any).toString()
      );
    });

    it("should return null for non-existent category", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const foundCategory = await categoryRepository.findById(nonExistentId);

      expect(foundCategory).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const foundCategory = await categoryRepository.findById("invalid-id");

      expect(foundCategory).toBeNull();
    });

    it("should return null for category belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const category = await TestDataFactory.createCategory(testUser._id);
      const foundCategory = await categoryRepository.findById(
        (category._id as any).toString(),
        (otherUser._id as any).toString()
      );

      expect(foundCategory).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find all categories for user", async () => {
      await TestDataFactory.createCategory(testUser._id, { name: "Food" });
      await TestDataFactory.createCategory(testUser._id, { name: "Transport" });

      const categories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(categories).toHaveLength(2);
      expect(categories[0].user.toString()).toBe(testUser._id.toString());
      expect(categories[1].user.toString()).toBe(testUser._id.toString());
    });

    it("should filter categories by type", async () => {
      await TestDataFactory.createCategory(testUser._id, { type: "expense" });
      await TestDataFactory.createCategory(testUser._id, { type: "income" });

      const expenseCategories = await categoryRepository.findByUser(
        (testUser._id as any).toString(),
        "expense"
      );

      expect(expenseCategories).toHaveLength(1);
      expect(expenseCategories[0].type).toBe("expense");
    });

    it("should return empty array for user with no categories", async () => {
      const categories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(categories).toHaveLength(0);
    });

    it("should not return categories from other users", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      await TestDataFactory.createCategory(testUser._id);
      await TestDataFactory.createCategory((otherUser._id as any).toString());

      const categories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );

      expect(categories).toHaveLength(1);
      expect(categories[0].user.toString()).toBe(
        (testUser._id as any).toString()
      );
    });
  });

  describe("update", () => {
    it("should update category successfully", async () => {
      const category = await TestDataFactory.createCategory(testUser._id);
      const updateData = {
        name: "Updated Food",
        color: "#00FF00",
      };

      const updatedCategory = await categoryRepository.update(
        (category._id as any).toString(),
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedCategory).toBeDefined();
      expect(updatedCategory?.name).toBe("Updated Food");
      expect(updatedCategory?.color).toBe("#00FF00");
    });

    it("should return null for non-existent category", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: "Updated Category" };

      const updatedCategory = await categoryRepository.update(
        nonExistentId,
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedCategory).toBeNull();
    });

    it("should return null for category belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const category = await TestDataFactory.createCategory(testUser._id);
      const updateData = { name: "Updated Category" };

      const updatedCategory = await categoryRepository.update(
        (category._id as any).toString(),
        (otherUser._id as any).toString(),
        updateData
      );

      expect(updatedCategory).toBeNull();
    });

    it("should return null for invalid id", async () => {
      const updateData = { name: "Updated Category" };

      const updatedCategory = await categoryRepository.update(
        "invalid-id",
        (testUser._id as any).toString(),
        updateData
      );

      expect(updatedCategory).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete category successfully", async () => {
      const category = await TestDataFactory.createCategory(testUser._id);

      const result = await categoryRepository.delete(
        (category._id as any).toString(),
        (testUser._id as any).toString()
      );

      expect(result).toBe(true);

      // Verify category is deleted
      const deletedCategory = await categoryRepository.findById(
        (category._id as any).toString()
      );
      expect(deletedCategory).toBeNull();
    });

    it("should return false for non-existent category", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await categoryRepository.delete(
        nonExistentId,
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });

    it("should return false for category belonging to different user", async () => {
      const otherUser = await TestDataFactory.createUser({
        email: "other@example.com",
      });
      const category = await TestDataFactory.createCategory(testUser._id);

      const result = await categoryRepository.delete(
        (category._id as any).toString(),
        (otherUser._id as any).toString()
      );

      expect(result).toBe(false);

      // Verify category still exists
      const existingCategory = await categoryRepository.findById(
        (category._id as any).toString()
      );
      expect(existingCategory).toBeDefined();
    });

    it("should return false for invalid id", async () => {
      const result = await categoryRepository.delete(
        "invalid-id",
        (testUser._id as any).toString()
      );

      expect(result).toBe(false);
    });
  });

  describe("createDefaultCategories", () => {
    it("should create default categories for user", async () => {
      await categoryRepository.createDefaultCategories(
        (testUser._id as any).toString()
      );

      // Verify default categories were created
      const categories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );
      expect(categories.length).toBeGreaterThan(0);

      // Check for common default categories
      const categoryNames = categories.map((cat) => cat.name);
      expect(categoryNames).toContain("Alimentação");
      expect(categoryNames).toContain("Transporte");
    });

    it("should create all default categories", async () => {
      await categoryRepository.createDefaultCategories(
        (testUser._id as any).toString()
      );

      const categories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );
      expect(categories.length).toBe(23); // Total default categories
    });

    it("should not create duplicate default categories", async () => {
      // Create default categories first time
      await categoryRepository.createDefaultCategories(
        (testUser._id as any).toString()
      );

      const firstCallCategories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );
      expect(firstCallCategories.length).toBe(23);

      // Try to create default categories again
      await categoryRepository.createDefaultCategories(
        (testUser._id as any).toString()
      );

      const secondCallCategories = await categoryRepository.findByUser(
        (testUser._id as any).toString()
      );

      // Should still be 23, not 46 (duplicated)
      expect(secondCallCategories.length).toBe(23);
    });
  });
});
