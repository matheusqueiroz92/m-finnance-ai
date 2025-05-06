import { 
    ICategoryCreateDTO, 
    ICategoryUpdateDTO, 
    ICategoryDTO 
  } from '../entities/ICategory';
  
  export interface ICategoryService {
    createCategory(userId: string, categoryData: ICategoryCreateDTO): Promise<ICategoryDTO>;
    getCategoriesByUserId(userId: string, type?: string): Promise<ICategoryDTO[]>;
    getCategoryById(categoryId: string, userId: string): Promise<ICategoryDTO>;
    updateCategory(categoryId: string, userId: string, updateData: ICategoryUpdateDTO): Promise<ICategoryDTO>;
    deleteCategory(categoryId: string, userId: string): Promise<void>;
    createDefaultCategories(userId: string): Promise<void>;
  }