import { ClientSession } from 'mongoose';
import { IInvestment, InvestmentType } from '../entities/IInvestment';

export interface IInvestmentRepository {
  create(data: Partial<IInvestment>, options?: { session?: ClientSession }): Promise<IInvestment>;
  findById(id: string, userId?: string): Promise<IInvestment | null>;
  findByUser(userId: string, filters?: { type?: InvestmentType; isActive?: boolean; account?: string }): Promise<IInvestment[]>;
  countByUser(userId: string, filters?: { type?: InvestmentType; isActive?: boolean; account?: string }): Promise<number>;
  update(id: string, userId: string, data: Partial<IInvestment>, options?: { session?: ClientSession }): Promise<IInvestment | null>;
  delete(id: string, userId: string): Promise<boolean>;
  getInvestmentsByAccount(userId: string, accountId: string): Promise<IInvestment[]>;
}