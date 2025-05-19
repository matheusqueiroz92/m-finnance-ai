import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { CategoryModel } from '../schemas/CategorySchema';
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository';
import { ICategory } from '../interfaces/entities/ICategory';

@injectable()
export class CategoryRepository implements ICategoryRepository {
  async create(data: Partial<ICategory>, options?: { session?: ClientSession }): Promise<ICategory> {
    const category = new CategoryModel(data);
    return await category.save(options);
  }

  async findById(id: string, userId?: string): Promise<ICategory | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    return await CategoryModel.findOne(query);
  }

  async findByUser(userId: string, type?: string): Promise<ICategory[]> {
    const query: any = { user: userId };
    
    if (type) query.type = type;
    
    return await CategoryModel.find(query).sort({ name: 1 });
  }

  async update(id: string, userId: string, data: Partial<ICategory>, options?: { session?: ClientSession }): Promise<ICategory | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await CategoryModel.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await CategoryModel.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
  }

  async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      // Income categories
      { name: 'Salário', type: 'income', icon: 'wallet', color: '#4CAF50', isDefault: true },
      { name: 'Investimentos', type: 'income', icon: 'trending-up', color: '#2196F3', isDefault: true },
      { name: 'Bônus', type: 'income', icon: 'star', color: '#FFC107', isDefault: true },
      { name: 'Outros', type: 'income', icon: 'plus-circle', color: '#9C27B0', isDefault: true },
      { name: 'Retirada de Investimento', type: 'income', icon: 'log-out', color: '#607D8B', isDefault: true },
      
      // Expense categories
      { name: 'Alimentação', type: 'expense', icon: 'shopping-bag', color: '#F44336', isDefault: true },
      { name: 'Moradia', type: 'expense', icon: 'home', color: '#795548', isDefault: true },
      { name: 'Transporte', type: 'expense', icon: 'car', color: '#FF9800', isDefault: true },
      { name: 'Lazer', type: 'expense', icon: 'film', color: '#9C27B0', isDefault: true },
      { name: 'Saúde', type: 'expense', icon: 'activity', color: '#E91E63', isDefault: true },
      { name: 'Educação', type: 'expense', icon: 'book', color: '#3F51B5', isDefault: true },
      { name: 'Contas', type: 'expense', icon: 'file-text', color: '#607D8B', isDefault: true },
      { name: 'Outros', type: 'expense', icon: 'more-horizontal', color: '#9E9E9E', isDefault: true },
      
      // Investment categories
      { name: 'Ações', type: 'investment', icon: 'bar-chart-2', color: '#4CAF50', isDefault: true },
      { name: 'Fundos', type: 'investment', icon: 'briefcase', color: '#2196F3', isDefault: true },
      { name: 'Renda Fixa', type: 'investment', icon: 'shield', color: '#FFC107', isDefault: true },
      { name: 'Criptomoedas', type: 'investment', icon: 'dollar-sign', color: '#FF9800', isDefault: true },
      { name: 'Aporte em Criptomoedas', type: 'investment', icon: 'dollar-sign', color: '#FF9800', isDefault: true },
      { name: 'Imóveis', type: 'investment', icon: 'home', color: '#795548', isDefault: true },
      { name: 'Previdência', type: 'investment', icon: 'shield', color: '#3F51B5', isDefault: true },
      { name: 'Outros Investimentos', type: 'investment', icon: 'more-horizontal', color: '#9E9E9E', isDefault: true }
    ];
    
    // Add user ID to each category
    const categoriesWithUserId = defaultCategories.map(category => ({
      ...category,
      user: new mongoose.Types.ObjectId(userId),
    }));
    
    // Create categories in batch
    await CategoryModel.insertMany(categoriesWithUserId);
  }
}