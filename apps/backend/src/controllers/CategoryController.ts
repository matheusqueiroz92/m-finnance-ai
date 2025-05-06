import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  private categoryService: CategoryService;
  
  constructor() {
    this.categoryService = new CategoryService();
  }
  
  /**
   * Create a new category
   */
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, type, icon, color } = req.body;
      
      const categoryData = {
        user: req.user._id,
        name,
        type,
        icon,
        color,
        isDefault: false,
      };
      
      const category = await this.categoryService.createCategory(req.user._id, categoryData);
      
      res.status(201).json({
        success: true,
        data: category,
      });
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
      
      res.status(200).json({
        success: true,
        data: categories,
      });
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
        throw new Error('Category ID is required');
      }
      
      const category = await this.categoryService.getCategoryById(
        req.params.id,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: category,
      });
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
        throw new Error('Category ID is required');
      }
      
      const { name, icon, color } = req.body;
      
      const updateData: Partial<{ name: any; icon: any; color: any }> = {
        name,
        icon,
        color,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
      );
      
      const category = await this.categoryService.updateCategory(
        req.params.id,
        req.user._id,
        updateData
      );
      
      res.status(200).json({
        success: true,
        data: category,
      });
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
        throw new Error('Category ID is required');
      }
      
      const result = await this.categoryService.deleteCategory(
        req.params.id,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}