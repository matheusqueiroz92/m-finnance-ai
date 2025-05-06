import { ApiError } from '../utils/ApiError';
import { TransactionModelClass } from '../models/schemas/TransactionSchema';
import { AccountModelClass } from '../models/schemas/AccountSchema';
import { TransactionCreateInput, TransactionUpdateInput, TransactionFilterInput } from '../validators/transactionValidator';
import mongoose from 'mongoose';

export class TransactionService {
  private transactionModel: TransactionModelClass;
  private accountModel: AccountModelClass;

  constructor() {
    this.transactionModel = new TransactionModelClass();
    this.accountModel = new AccountModelClass();
  }

  /**
   * Create a new transaction
   */
  async createTransaction(userId: string, transactionData: TransactionCreateInput): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Prepare transaction data with user ID
      const newTransaction = {
        ...transactionData,
        user: userId,
      };
      
      // Create the transaction
      const transaction = await this.transactionModel.create(newTransaction);
      
      // Update account balance
      const account = await this.accountModel.findById(transactionData.account, userId);
      
      if (!account) {
        throw new ApiError('Conta não encontrada', 404);
      }
      
      const amount = transactionData.amount || 0;
      
      if (transactionData.type === 'income') {
        account.balance += amount;
      } else if (transactionData.type === 'expense') {
        account.balance -= amount;
      }
      
      await account.save({ session });
      
      await session.commitTransaction();
      
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Get user transactions with filters
   */
  async getUserTransactions(userId: string, filters: TransactionFilterInput): Promise<any> {
    const transactions = await this.transactionModel.findByUser(userId, filters);
    const total = await this.transactionModel.countByUser(userId, filters);
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    return {
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
  
  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string, userId: string): Promise<any> {
    const transaction = await this.transactionModel.findById(transactionId, userId);
    
    if (!transaction) {
      throw new ApiError('Transação não encontrada', 404);
    }
    
    return transaction;
  }
  
  /**
   * Update a transaction
   */
  async updateTransaction(
    transactionId: string,
    userId: string,
    updateData: TransactionUpdateInput
  ): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get original transaction
      const originalTransaction = await this.transactionModel.findById(transactionId, userId);
      
      if (!originalTransaction) {
        throw new ApiError('Transação não encontrada', 404);
      }
      
      // Update transaction
      const updatedTransaction = await this.transactionModel.update(
        transactionId,
        userId,
        updateData
      );
      
      // Update account balance if amount or type changed
      if (
        (updateData.amount && updateData.amount !== originalTransaction.amount) ||
        (updateData.type && updateData.type !== originalTransaction.type) ||
        (updateData.account && updateData.account.toString() !== originalTransaction.account.toString())
      ) {
        // Revert the original transaction effect
        let originalAccount = await this.accountModel.findById(originalTransaction.account.toString(), userId);
        
        if (!originalAccount) {
          throw new ApiError('Conta original não encontrada', 404);
        }
        
        if (originalTransaction.type === 'income') {
          originalAccount.balance -= originalTransaction.amount;
        } else if (originalTransaction.type === 'expense') {
          originalAccount.balance += originalTransaction.amount;
        }
        
        await originalAccount.save({ session });
        
        // Apply the new transaction effect
        let targetAccount = originalAccount;
        
        // If account changed, find the new account
        if (updateData.account && updateData.account.toString() !== originalTransaction.account.toString()) {
          targetAccount = await this.accountModel.findById(updateData.account, userId);
          
          if (!targetAccount) {
            throw new ApiError('Conta de destino não encontrada', 404);
          }
        }
        
        const newType = updateData.type || originalTransaction.type;
        const newAmount = updateData.amount || originalTransaction.amount;
        
        if (newType === 'income') {
          targetAccount.balance += newAmount;
        } else if (newType === 'expense') {
          targetAccount.balance -= newAmount;
        }
        
        await targetAccount.save({ session });
      }
      
      await session.commitTransaction();
      
      return updatedTransaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Delete a transaction
   */
  async deleteTransaction(transactionId: string, userId: string): Promise<{ success: boolean }> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get transaction
      const transaction = await this.transactionModel.findById(transactionId, userId);
      
      if (!transaction) {
        throw new ApiError('Transação não encontrada', 404);
      }
      
      // Revert the transaction effect on account balance
      const account = await this.accountModel.findById(transaction.account.toString(), userId);
      
      if (!account) {
        throw new ApiError('Conta não encontrada', 404);
      }
      
      if (transaction.type === 'income') {
        account.balance -= transaction.amount;
      } else if (transaction.type === 'expense') {
        account.balance += transaction.amount;
      }
      
      await account.save({ session });
      
      // Delete the transaction
      const deleted = await this.transactionModel.delete(transactionId, userId);
      
      await session.commitTransaction();
      
      return { success: deleted };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Get transactions within date range
    const transactions = await this.transactionModel.findByDateRange(userId, startDate, now);

    // Calculate income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeByCategory: Record<string, number> = {};
    let expensesByCategory: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
        
        const categoryName = transaction.category 
          ? (transaction.category as any).name 
          : 'Sem categoria';
        
        if (!incomeByCategory[categoryName]) {
          incomeByCategory[categoryName] = 0;
        }
        
        incomeByCategory[categoryName] += transaction.amount;
      } else if (transaction.type === 'expense') {
        totalExpenses += transaction.amount;
        
        const categoryName = transaction.category 
          ? (transaction.category as any).name 
          : 'Sem categoria';
        
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = 0;
        }
        
        expensesByCategory[categoryName] += transaction.amount;
      }
    });
    
    // Calculate balance
    const balance = totalIncome - totalExpenses;
    
    // Get transactions by day for chart data
    const transactionsByDay: Record<string, { income: number; expense: number }> = {};
    
    // Initialize days
    const dayCount = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i <= dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      transactionsByDay[dateString] = { income: 0, expense: 0 };
    }
    
    // Fill data
    transactions.forEach(transaction => {
      const dateString = transaction.date.toISOString().split('T')[0];
      
      if (!transactionsByDay[dateString]) {
        transactionsByDay[dateString] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        transactionsByDay[dateString].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        transactionsByDay[dateString].expense += transaction.amount;
      }
    });
    
    // Convert to array for chart data
    const chartData = Object.entries(transactionsByDay).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Prepare top categories
    const topExpenseCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const topIncomeCategories = Object.entries(incomeByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return {
      overview: {
        totalIncome,
        totalExpenses,
        balance,
        period,
      },
      expensesByCategory: topExpenseCategories,
      incomeByCategory: topIncomeCategories,
      chartData,
    };
  }
}