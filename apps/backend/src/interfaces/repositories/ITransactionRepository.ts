import { ClientSession, Types } from 'mongoose';
import { 
  ITransaction, 
  ITransactionPopulated 
} from '../entities/ITransaction';

export interface ITransactionRepository {
  create(data: Partial<ITransaction>, options?: { session?: ClientSession }): Promise<ITransactionPopulated>;
  findById(id: string, userId?: string): Promise<ITransactionPopulated | null>;
  findByUser(userId: string, filters?: any): Promise<ITransactionPopulated[]>;
  countByUser(userId: string, filters?: any): Promise<number>;
  update(id: string, userId: string, data: Partial<ITransaction>, options?: { session?: ClientSession }): Promise<ITransactionPopulated | null>;
  delete(id: string, userId: string, options?: { session?: ClientSession }): Promise<boolean>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ITransactionPopulated[]>;
  findByCategory(userId: string, categoryId: string): Promise<ITransactionPopulated[]>;
  findByAccount(userId: string, accountId: string): Promise<ITransactionPopulated[]>;
}