import { Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  user: Types.ObjectId;
  account: Types.ObjectId;
  category: Types.ObjectId;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  description: string;
  date: Date;
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: IAttachment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionPopulated {
  _id: string;
  user: Types.ObjectId;
  account: {
    _id: string;
    name: string;
    type: string;
    institution: string;
  };
  category: {
    _id: string;
    name: string;
    type: string;
    icon?: string;
    color?: string;
  };
  amount: number;
  type: 'income' | 'expense' | 'investment';
  description: string;
  date: Date;
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: IAttachment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionCreateDTO {
  account: string;
  category: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  description: string;
  date?: Date | string;
  isRecurring?: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

export interface ITransactionUpdateDTO {
  account?: string;
  category?: string;
  amount?: number;
  type?: 'income' | 'expense' | 'investment';
  description?: string;
  date?: Date | string;
  isRecurring?: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

export interface ITransactionFilters {
  type?: 'income' | 'expense' | 'investment';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  account?: string;
  page: number;
  limit: number;
}

export interface ITransactionListResult {
  transactions: ITransactionPopulated[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ITransactionStats {
  overview: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    period: 'day' | 'week' | 'month' | 'year';
  };
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  incomeByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  chartData: {
    date: string;
    income: number;
    expense: number;
  }[];
}

export interface IAttachment {
  _id?: string | Types.ObjectId;
  path: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  description?: string;
  uploadedAt: Date;
}