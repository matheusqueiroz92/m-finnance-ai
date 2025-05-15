export interface Transaction {
  _id: string;
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
  creditCard?: {
    _id: string;
    cardNumber: string;
    cardBrand: string;
    cardholderName: string;
  };
  amount: number;
  type: 'income' | 'expense' | 'investment';
  description: string;
  date: Date;
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: Attachment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  _id: string;
  path: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  description?: string;
  uploadedAt: Date;
}

export interface TransactionCreateData {
  account: string;
  category: string;
  creditCard?: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  description: string;
  date?: string;
  isRecurring?: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

export interface TransactionUpdateData {
  account?: string;
  category?: string;
  creditCard?: string;
  amount?: number;
  type?: 'income' | 'expense' | 'investment';
  description?: string;
  date?: string;
  isRecurring?: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'investment';
  category?: string;
  startDate?: string;
  endDate?: string;
  account?: string;
  page?: number;
  limit?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TransactionStats {
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