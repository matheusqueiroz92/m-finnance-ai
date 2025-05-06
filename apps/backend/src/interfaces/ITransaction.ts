import mongoose, { Document } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  account: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  description: string;
  date: Date;
  isRecurring: boolean;
  recurrenceInterval?: string;
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionModel {
  create(transactionData: Partial<ITransaction>): Promise<ITransaction>;
  findById(id: string, userId?: string): Promise<ITransaction | null>;
  findByUser(userId: string, filters?: any): Promise<ITransaction[]>;
  countByUser(userId: string, filters?: any): Promise<number>;
  update(id: string, userId: string, updateData: Partial<ITransaction>): Promise<ITransaction | null>;
  delete(id: string, userId: string): Promise<boolean>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ITransaction[]>;
  findByCategory(userId: string, categoryId: string): Promise<ITransaction[]>;
  findByAccount(userId: string, accountId: string): Promise<ITransaction[]>;
}