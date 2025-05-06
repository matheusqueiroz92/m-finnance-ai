// src/services/CategoryService.ts
import { ApiError } from '../utils/ApiError';
import { CategoryModelClass } from '../models/schemas/CategorySchema';
import { TransactionModelClass } from '../models/schemas/TransactionSchema';
import { CategoryCreateInput, CategoryUpdateInput } from '../validators/categoryValidator';

export class CategoryService {
  private categoryModel: CategoryModelClass;
  private transactionModel: TransactionModelClass;

  constructor() {
    this.categoryModel = new CategoryModelClass();
    this.transactionModel = new TransactionModelClass();
  }

  /**
   * Create a new category
   */
  async createCategory(userId: string, categoryData: CategoryCreateInput): Promise<any> {
    // Create category with user ID
    const newCategory = await this.categoryModel.create({
      ...categoryData,
      user: userId
    });
    
    return newCategory;
  }
  
  /**
   * Get categories by user ID with optional type filter
   */
  async getCategoriesByUserId(userId: string, type?: string): Promise<any[]> {
    const categories = await this.categoryModel.findByUser(userId, type);
    return categories;
  }
  
  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string, userId: string): Promise<any> {
    const category = await this.categoryModel.findById(categoryId, userId);
    
    if (!category) {
      throw new ApiError('Categoria não encontrada', 404);
    }
    
    return category;
  }
  
  /**
   * Update a category
   */
  async updateCategory(categoryId: string, userId: string, updateData: CategoryUpdateInput): Promise<any> {
    const updatedCategory = await this.categoryModel.update(categoryId, userId, updateData);
    
    if (!updatedCategory) {
      throw new ApiError('Categoria não encontrada', 404);
    }
    
    return updatedCategory;
  }
    
  /**
     * Delete a category
     */
  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    // Check if category is in use by transactions
    const categoryTransactions = await this.transactionModel.findByCategory(userId, categoryId);
    
    if (categoryTransactions.length > 0) {
      throw new ApiError('Não é possível excluir uma categoria que está sendo usada por transações', 400);
    }
    
    const result = await this.categoryModel.delete(categoryId, userId);
    
    if (!result) {
      throw new ApiError('Categoria não encontrada', 404);
    }
  }

  /**
   * Create default categories for a new user
   */
  async createDefaultCategories(userId: string): Promise<void> {
    await this.categoryModel.createDefaultCategories(userId);
  }
}