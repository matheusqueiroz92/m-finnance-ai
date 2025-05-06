import { ClientSession } from 'mongoose';
import { ICategory } from '../entities/ICategory';

export interface ICategoryRepository {
  create(data: Partial<ICategory>, options?: { session?: ClientSession }): Promise<ICategory>;
  findById(id: string, userId?: string): Promise<ICategory | null>;
  findByUser(userId: string, type?: string): Promise<ICategory[]>;
  update(id: string, userId: string, data: Partial<ICategory>, options?: { session?: ClientSession }): Promise<ICategory | null>;
  delete(id: string, userId: string): Promise<boolean>;
  createDefaultCategories(userId: string): Promise<void>;
}