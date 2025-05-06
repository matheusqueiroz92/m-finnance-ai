import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ICategoryService } from '../interfaces/services/ICategoryService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

@injectable()
export class CategoryController {
  constructor(
    @inject('CategoryService')
    private categoryService: ICategoryService
  ) {}
  
  /**
   * Create a new category
   */
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, type, icon, color } = req.body;
      
      const categoryData = {
        name,
        type,
        icon,
        color,
        isDefault: false,
      };
      
      const category = await this.categoryService.createCategory(req.user._id, categoryData);
      
      ApiResponse.created(res, category, 'Categoria criada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get categories for the authenticated user
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const type = req.query.type as string | undefined;
      
      const categories = await this.categoryService.getCategoriesByUserId(req.user._id, type);
      
      ApiResponse.success(res, categories, 'Categorias recuperadas com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get category by ID
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError('ID da categoria é obrigatório', 400);
      }
      
      const category = await this.categoryService.getCategoryById(
        req.params.id,
        req.user._id
      );
      
      ApiResponse.success(res, category, 'Categoria recuperada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a category
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError('ID da categoria é obrigatório', 400);
      }
      
      const { name, icon, color } = req.body;
      
      const updateData = {
        name,
        icon,
        color,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const category = await this.categoryService.updateCategory(
        req.params.id,
        req.user._id,
        updateData
      );
      
      ApiResponse.success(res, category, 'Categoria atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a category
   */
  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError('ID da categoria é obrigatório', 400);
      }
      
      await this.categoryService.deleteCategory(
        req.params.id,
        req.user._id
      );
      
      ApiResponse.success(res, { success: true }, 'Categoria excluída com sucesso');
    } catch (error) {
      next(error);
    }
  };
}