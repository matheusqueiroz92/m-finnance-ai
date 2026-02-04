import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { ICategoryService } from '../interfaces/services/ICategoryService';
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { 
  ICategoryCreateDTO, 
  ICategoryUpdateDTO, 
  ICategoryDTO,
  ICategory
} from '../interfaces/entities/ICategory';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: ICategoryRepository,
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository
  ) {}

  /**
   * Create a new category
   * @param userId - The ID of the user to create the category for
   * @param categoryData - The data for the new category
   * @returns A promise that resolves to the created category
   */
  async createCategory(userId: string, categoryData: ICategoryCreateDTO): Promise<ICategoryDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Create category with user ID
      const newCategory = {
        ...categoryData,
        user: new mongoose.Types.ObjectId(userId),
        isDefault: categoryData.isDefault !== undefined ? categoryData.isDefault : false
      };
      
      const category = await this.categoryRepository.create(newCategory, { session });
      
      return this.mapToDTO(category);
    });
  }
  
  /**
   * Get categories by user ID with optional type filter
   * @param userId - The ID of the user to get the categories for
   * @param type - The type of categories to get
   * @returns A promise that resolves to the categories
   */
  async getCategoriesByUserId(userId: string, type?: string): Promise<ICategoryDTO[]> {
    const categories = await this.categoryRepository.findByUser(userId, type);
    return categories.map(category => this.mapToDTO(category));
  }
  
  /**
   * Get category by ID
   * @param categoryId - The ID of the category to get
   * @param userId - The ID of the user to get the category for
   * @returns A promise that resolves to the category
   */
  async getCategoryById(categoryId: string, userId: string): Promise<ICategoryDTO> {
    const category = await this.categoryRepository.findById(categoryId, userId);
    
    if (!category) {
      throw new ApiError('Categoria não encontrada', 404);
    }
    
    return this.mapToDTO(category);
  }
  
  /**
   * Update a category
   * @param categoryId - The ID of the category to update
   * @param userId - The ID of the user to update the category for
   * @param updateData - The data to update the category with
   * @returns A promise that resolves to the updated category
   */
  async updateCategory(categoryId: string, userId: string, updateData: ICategoryUpdateDTO): Promise<ICategoryDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      const updatedCategory = await this.categoryRepository.update(categoryId, userId, updateData, { session });
      
      if (!updatedCategory) {
        throw new ApiError('Categoria não encontrada', 404);
      }
      
      return this.mapToDTO(updatedCategory);
    });
  }
  
  /**
   * Delete a category
   * @param categoryId - The ID of the category to delete
   * @param userId - The ID of the user to delete the category for
   * @returns A promise that resolves when the category is deleted
   */
  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    // Check if category is in use by transactions
    const categoryTransactions = await this.transactionRepository.findByCategory(userId, categoryId);
    
    if (categoryTransactions.length > 0) {
      throw new ApiError('Não é possível excluir uma categoria que está sendo usada por transações', 400);
    }
    
    const result = await this.categoryRepository.delete(categoryId, userId);
    
    if (!result) {
      throw new ApiError('Categoria não encontrada', 404);
    }
  }
  
  /**
   * Create default categories for a new user
   * @param userId - The ID of the user to create the default categories for
   * @returns A promise that resolves when the default categories are created
   */
  async createDefaultCategories(userId: string): Promise<void> {
    await this.categoryRepository.createDefaultCategories(userId);
  }
  
  /**
   * Map Category model to DTO
   * @param category - The category to map to a DTO
   * @returns The category as a DTO
   */
  private mapToDTO(category: ICategory): ICategoryDTO {
    // Garantir que _id existe e convertê-lo para string
    const id = category._id?.toString() || '';
    
    return {
      _id: id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
}