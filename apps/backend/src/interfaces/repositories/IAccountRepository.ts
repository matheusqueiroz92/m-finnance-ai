import { ClientSession } from 'mongoose';
import { IAccount } from '../entities/IAccount';

export interface IAccountRepository {
  create(data: Partial<IAccount>, options?: { session?: ClientSession }): Promise<IAccount>;
  findById(id: string, userId?: string): Promise<IAccount | null>;
  findByUser(userId: string, filters?: any): Promise<IAccount[]>;
  countByUser(userId: string, filters?: any): Promise<number>;
  update(id: string, userId: string, data: Partial<IAccount>, options?: { session?: ClientSession }): Promise<IAccount | null>;
  delete(id: string, userId: string): Promise<boolean>;
  findAll(page?: number, limit?: number, filters?: any): Promise<{ accounts: IAccount[]; total: number }>;
}