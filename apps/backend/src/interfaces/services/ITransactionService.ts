import { 
  ITransactionCreateDTO,
  ITransactionUpdateDTO,
  ITransactionFilters,
  ITransactionPopulated,
  ITransactionListResult,
  ITransactionStats
} from '../entities/ITransaction';

export interface ITransactionService {
  createTransaction(userId: string, transactionData: ITransactionCreateDTO): Promise<ITransactionPopulated>;
  getUserTransactions(userId: string, filters: ITransactionFilters): Promise<ITransactionListResult>;
  getTransactionById(transactionId: string, userId: string): Promise<ITransactionPopulated>;
  updateTransaction(transactionId: string, userId: string, updateData: ITransactionUpdateDTO): Promise<ITransactionPopulated>;
  deleteTransaction(transactionId: string, userId: string): Promise<{ success: boolean }>;
  getTransactionStats(userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<ITransactionStats>;
  removeAttachment(transactionId: string, userId: string, attachmentId: string): Promise<ITransactionPopulated>;
  getTransactionsByInvestment(userId: string, investmentId: string): Promise<ITransactionPopulated[]>; // Novo método
}