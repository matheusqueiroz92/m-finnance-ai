import mongoose, { Document } from 'mongoose';

export interface IAccount extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  institution: string;
  accountNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountModel {
  create(accountData: Partial<IAccount>): Promise<IAccount>;
  findById(id: string, userId?: string): Promise<IAccount | null>;
  findByUser(userId: string, filters?: any): Promise<IAccount[]>;
  countByUser(userId: string, filters?: any): Promise<number>;
  update(id: string, userId: string, updateData: Partial<IAccount>): Promise<IAccount | null>;
  delete(id: string, userId: string): Promise<boolean>;
  findAll(page: number, limit: number, filters?: any): Promise<{ accounts: IAccount[]; total: number }>;
}