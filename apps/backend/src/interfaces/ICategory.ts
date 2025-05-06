import mongoose, { Document } from 'mongoose';

export interface ICategory extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryModel {
  create(categoryData: Partial<ICategory>): Promise<ICategory>;
  findById(id: string, userId?: string): Promise<ICategory | null>;
  findByUser(userId: string, type?: string): Promise<ICategory[]>;
  update(id: string, userId: string, updateData: Partial<ICategory>): Promise<ICategory | null>;
  delete(id: string, userId: string): Promise<boolean>;
  createDefaultCategories(userId: string): Promise<void>;
}