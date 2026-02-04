import { Request, Response, NextFunction } from "express";
import { CategoryController } from "../../controllers/CategoryController";
import { ICategoryService } from "../../interfaces/services/ICategoryService";

describe("CategoryController", () => {
  let categoryController: CategoryController;
  let mockCategoryService: jest.Mocked<ICategoryService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Mock CategoryService
    mockCategoryService = {
      createCategory: jest.fn(),
      getCategoriesByUserId: jest.fn(),
      getCategoryById: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
    } as jest.Mocked<ICategoryService>;

    // Create controller instance
    categoryController = new CategoryController(mockCategoryService);

    // Mock Request
    mockRequest = {
      user: { _id: "user123" },
      body: {},
      params: {},
      query: {},
    };

    // Mock Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock NextFunction
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create a category successfully", async () => {
      const categoryData = {
        name: "Alimentação",
        type: "expense",
        icon: "🍔",
        color: "#FF5733",
      };

      const mockCategory = {
        _id: "category123",
        ...categoryData,
        user: "user123",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = categoryData;
      mockCategoryService.createCategory.mockResolvedValue(mockCategory as any);

      await categoryController.createCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        "user123",
        {
          ...categoryData,
          isDefault: false,
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Categoria criada com sucesso",
          data: mockCategory,
        })
      );
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;

      await categoryController.createCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should handle create category errors", async () => {
      const error = new Error("Database error");
      mockRequest.body = {
        name: "Alimentação",
        type: "expense",
      };
      mockCategoryService.createCategory.mockRejectedValue(error);

      await categoryController.createCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getCategories", () => {
    it("should get categories successfully", async () => {
      const mockCategories = [
        {
          _id: "cat1",
          name: "Alimentação",
          type: "expense",
          icon: "🍔",
          color: "#FF5733",
          user: "user123",
          isDefault: false,
        },
        {
          _id: "cat2",
          name: "Salário",
          type: "income",
          icon: "💰",
          color: "#33FF57",
          user: "user123",
          isDefault: false,
        },
      ];

      mockCategoryService.getCategoriesByUserId.mockResolvedValue(
        mockCategories as any
      );

      await categoryController.getCategories(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.getCategoriesByUserId).toHaveBeenCalledWith(
        "user123",
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Categorias recuperadas com sucesso",
          data: mockCategories,
        })
      );
    });

    it("should filter categories by type", async () => {
      const mockCategories = [
        {
          _id: "cat1",
          name: "Alimentação",
          type: "expense",
          icon: "🍔",
          color: "#FF5733",
          user: "user123",
          isDefault: false,
        },
      ];

      mockRequest.query = { type: "expense" };
      mockCategoryService.getCategoriesByUserId.mockResolvedValue(
        mockCategories as any
      );

      await categoryController.getCategories(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.getCategoriesByUserId).toHaveBeenCalledWith(
        "user123",
        "expense"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;

      await categoryController.getCategories(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.getCategoriesByUserId).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should handle get categories errors", async () => {
      const error = new Error("Database error");
      mockCategoryService.getCategoriesByUserId.mockRejectedValue(error);

      await categoryController.getCategories(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getCategoryById", () => {
    it("should get category by id successfully", async () => {
      const mockCategory = {
        _id: "category123",
        name: "Alimentação",
        type: "expense",
        icon: "🍔",
        color: "#FF5733",
        user: "user123",
        isDefault: false,
      };

      mockRequest.params = { id: "category123" };
      mockCategoryService.getCategoryById.mockResolvedValue(
        mockCategory as any
      );

      await categoryController.getCategoryById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(
        "category123",
        "user123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Categoria recuperada com sucesso",
          data: mockCategory,
        })
      );
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: "category123" };

      await categoryController.getCategoryById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.getCategoryById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should handle get category by id errors", async () => {
      const error = new Error("Category not found");
      mockRequest.params = { id: "category123" };
      mockCategoryService.getCategoryById.mockRejectedValue(error);

      await categoryController.getCategoryById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const updateData = {
        name: "Alimentação Atualizada",
        icon: "🍕",
        color: "#FF6633",
      };

      const mockUpdatedCategory = {
        _id: "category123",
        ...updateData,
        type: "expense",
        user: "user123",
        isDefault: false,
      };

      mockRequest.params = { id: "category123" };
      mockRequest.body = updateData;
      mockCategoryService.updateCategory.mockResolvedValue(
        mockUpdatedCategory as any
      );

      await categoryController.updateCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
        "category123",
        "user123",
        updateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Categoria atualizada com sucesso",
          data: mockUpdatedCategory,
        })
      );
    });

    it("should remove undefined fields from update data", async () => {
      const updateData = {
        name: "Alimentação Atualizada",
        icon: undefined,
        color: "#FF6633",
      };

      const mockUpdatedCategory = {
        _id: "category123",
        name: "Alimentação Atualizada",
        color: "#FF6633",
        type: "expense",
        user: "user123",
        isDefault: false,
      };

      mockRequest.params = { id: "category123" };
      mockRequest.body = updateData;
      mockCategoryService.updateCategory.mockResolvedValue(
        mockUpdatedCategory as any
      );

      await categoryController.updateCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
        "category123",
        "user123",
        { name: "Alimentação Atualizada", color: "#FF6633" }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: "category123" };

      await categoryController.updateCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.updateCategory).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should handle update category errors", async () => {
      const error = new Error("Update failed");
      mockRequest.params = { id: "category123" };
      mockRequest.body = { name: "Updated" };
      mockCategoryService.updateCategory.mockRejectedValue(error);

      await categoryController.updateCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteCategory", () => {
    it("should delete category successfully", async () => {
      mockRequest.params = { id: "category123" };
      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      await categoryController.deleteCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(
        "category123",
        "user123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Categoria excluída com sucesso",
          data: { success: true },
        })
      );
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: "category123" };

      await categoryController.deleteCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCategoryService.deleteCategory).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should handle delete category errors", async () => {
      const error = new Error("Delete failed");
      mockRequest.params = { id: "category123" };
      mockCategoryService.deleteCategory.mockRejectedValue(error);

      await categoryController.deleteCategory(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
