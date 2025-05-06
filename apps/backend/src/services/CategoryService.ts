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
   */
  async getCategoriesByUserId(userId: string, type?: string): Promise<ICategoryDTO[]> {
    const categories = await this.categoryRepository.findByUser(userId, type);
    return categories.map(category => this.mapToDTO(category));
  }
  
  /**
   * Get category by ID
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
   */
  async createDefaultCategories(userId: string): Promise<void> {
    await this.categoryRepository.createDefaultCategories(userId);
  }
  
  /**
   * Map Category model to DTO
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