import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { IAccountRepository } from '../interfaces/repositories/IAccountRepository';
import { 
  ITransactionCreateDTO,
  ITransactionUpdateDTO,
  ITransactionFilters,
  ITransactionPopulated,
  ITransactionListResult,
  ITransactionStats
} from '../interfaces/entities/ITransaction';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository,
    @inject('AccountRepository')
    private accountRepository: IAccountRepository
  ) {}

  async createTransaction(userId: string, transactionData: ITransactionCreateDTO): Promise<ITransactionPopulated> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Convertendo objetos de string para Date quando necessário
      const processedData: any = { ...transactionData };
      if (typeof processedData.date === 'string') {
        processedData.date = new Date(processedData.date);
      }
      
      // Convertendo strings para ObjectId
      const newTransaction = {
        ...processedData,
        user: new mongoose.Types.ObjectId(userId),
        account: new mongoose.Types.ObjectId(processedData.account),
        category: new mongoose.Types.ObjectId(processedData.category)
      };
      
      // Criar a transação
      const transaction = await this.transactionRepository.create(newTransaction, { session });
      
      // Atualizar o saldo da conta
      const account = await this.accountRepository.findById(processedData.account, userId) as { _id: mongoose.Types.ObjectId; balance: number } | null;
      
      if (!account) {
        throw new ApiError('Conta não encontrada', 404);
      }
      
      const amount = processedData.amount || 0;
      
      if (processedData.type === 'income') {
        account.balance += amount;
      } else if (processedData.type === 'expense') {
        account.balance -= amount;
      }
      
      await this.accountRepository.update(
        account._id.toString(), 
        userId, 
        { balance: account.balance }, 
        { session }
      );
      
      return transaction;
    });
  }
  
  async getUserTransactions(userId: string, filters: ITransactionFilters): Promise<ITransactionListResult> {
    // Processar datas nos filtros
    const processedFilters = { ...filters };
    
    const transactions = await this.transactionRepository.findByUser(userId, processedFilters);
    const total = await this.transactionRepository.countByUser(userId, processedFilters);
    
    const page = processedFilters.page || 1;
    const limit = processedFilters.limit || 10;
    
    return {
      transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
  
  async getTransactionById(transactionId: string, userId: string): Promise<ITransactionPopulated> {
    const transaction = await this.transactionRepository.findById(transactionId, userId);
    
    if (!transaction) {
      throw new ApiError('Transação não encontrada', 404);
    }
    
    return transaction;
  }
  
  async updateTransaction(transactionId: string, userId: string, updateData: ITransactionUpdateDTO): Promise<ITransactionPopulated> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Processar data se for string
      const processedUpdateData: any = { ...updateData };
      if (typeof updateData.date === 'string') {
        processedUpdateData.date = new Date(updateData.date);
      }
      
      // Converter IDs para ObjectId
      if (processedUpdateData.account) {
        processedUpdateData.account = new mongoose.Types.ObjectId(processedUpdateData.account);
      }
      
      if (processedUpdateData.category) {
        processedUpdateData.category = new mongoose.Types.ObjectId(processedUpdateData.category);
      }
      
      // Obter a transação original
      const originalTransaction = await this.transactionRepository.findById(transactionId, userId);
      
      if (!originalTransaction) {
        throw new ApiError('Transação não encontrada', 404);
      }
      
      // Verificar se houve alteração de valor, tipo ou conta que afeta saldos
      const needsAccountUpdate = 
        (updateData.amount !== undefined && updateData.amount !== originalTransaction.amount) ||
        (updateData.type !== undefined && updateData.type !== originalTransaction.type) ||
        (updateData.account !== undefined && updateData.account !== originalTransaction.account._id.toString());
      
      if (needsAccountUpdate) {
        // Reverter o efeito da transação original
        const originalAccount = await this.accountRepository.findById(
          originalTransaction.account._id.toString(),
          userId
        ) as { _id: mongoose.Types.ObjectId, balance: number };
        
        if (!originalAccount) {
          throw new ApiError('Conta original não encontrada', 404);
        }
        
        // Reverter o efeito
        if (originalTransaction.type === 'income') {
          originalAccount.balance -= originalTransaction.amount;
        } else if (originalTransaction.type === 'expense') {
          originalAccount.balance += originalTransaction.amount;
        }
        
        await this.accountRepository.update(
          originalAccount._id.toString(),
          userId,
          { balance: originalAccount.balance },
          { session }
        );
        
        // Aplicar o efeito da nova transação
        let targetAccount = originalAccount;
        
        // Se a conta foi alterada, buscar a nova conta
        if (updateData.account && updateData.account !== originalTransaction.account._id.toString()) {
          const foundAccount = await this.accountRepository.findById(updateData.account, userId);
          if (!foundAccount) {
            throw new ApiError('Conta de destino não encontrada', 404);
          }
          targetAccount = foundAccount as { _id: mongoose.Types.ObjectId; balance: number };
          
          if (!targetAccount) {
            throw new ApiError('Conta de destino não encontrada', 404);
          }
        }
        
        // Aplicar o novo efeito
        const newType = updateData.type || originalTransaction.type;
        const newAmount = updateData.amount !== undefined ? updateData.amount : originalTransaction.amount;
        
        if (newType === 'income') {
          targetAccount.balance += newAmount;
        } else if (newType === 'expense') {
          targetAccount.balance -= newAmount;
        }
        
        await this.accountRepository.update(
          targetAccount._id.toString(),
          userId,
          { balance: targetAccount.balance },
          { session }
        );
      }
      
      // Atualizar a transação
      const updatedTransaction = await this.transactionRepository.update(
        transactionId,
        userId,
        processedUpdateData,
        { session }
      );
      
      if (!updatedTransaction) {
        throw new ApiError('Falha ao atualizar transação', 500);
      }
      
      return updatedTransaction;
    });
  }
  
  async deleteTransaction(transactionId: string, userId: string): Promise<{ success: boolean }> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Obter a transação
      const transaction = await this.transactionRepository.findById(transactionId, userId);
      
      if (!transaction) {
        throw new ApiError('Transação não encontrada', 404);
      }
      
      // Reverter o efeito da transação na conta
      const account = await this.accountRepository.findById(
        transaction.account._id.toString(),
        userId
      ) as { _id: mongoose.Types.ObjectId; balance: number } | null;
      
      if (!account) {
        throw new ApiError('Conta não encontrada', 404);
      }
      
      if (transaction.type === 'income') {
        account.balance -= transaction.amount;
      } else if (transaction.type === 'expense') {
        account.balance += transaction.amount;
      }
      
      await this.accountRepository.update(
        account?._id.toString() || '',
        userId,
        { balance: account.balance },
        { session }
      );
      
      // Excluir a transação
      const deleted = await this.transactionRepository.delete(transactionId, userId, { session });
      
      return { success: deleted };
    });
  }
  
  async getTransactionStats(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ITransactionStats> {
    // Calcular intervalo de datas com base no período
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
    
    // Obter transações no intervalo de datas
    const transactions = await this.transactionRepository.findByDateRange(userId, startDate, now);

    // Calcular receitas e despesas
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeByCategory: Record<string, number> = {};
    let expensesByCategory: Record<string, number> = {};
    
    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
        
        const categoryName = transaction.category ? transaction.category.name : 'Sem categoria';
        
        if (!incomeByCategory[categoryName]) {
          incomeByCategory[categoryName] = 0;
        }
        
        incomeByCategory[categoryName] += transaction.amount;
      } else if (transaction.type === 'expense') {
        totalExpenses += transaction.amount;
        
        const categoryName = transaction.category ? transaction.category.name : 'Sem categoria';
        
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = 0;
        }
        
        expensesByCategory[categoryName] += transaction.amount;
      }
    });
    
    // Calcular saldo
    const balance = totalIncome - totalExpenses;
    
    // Dados para gráfico por dia
    const transactionsByDay: Record<string, { income: number; expense: number }> = {};
    
    // Inicializar dias
    const dayCount = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i <= dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      if (dateKey) {
        transactionsByDay[dateKey] = { income: 0, expense: 0 };
      }
    }
    
    // Preencher dados
    for (const transaction of transactions) {
      try {
        // Verificar se a data é válida
        if (!(transaction.date instanceof Date)) {
          continue;
        }
        
        const dateKey = transaction.date.toISOString().split('T')[0];
        
        if (dateKey && transactionsByDay[dateKey]) {
          if (transaction.type === 'income') {
            transactionsByDay[dateKey].income += transaction.amount;
          } else if (transaction.type === 'expense') {
            transactionsByDay[dateKey].expense += transaction.amount;
          }
        }
      } catch (error) {
        console.error('Erro ao processar transação:', error);
        continue;
      }
    }
    
    // Converter para array para dados do gráfico
    const chartData = Object.entries(transactionsByDay).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Categorias com mais despesas
    const topExpenseCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Categorias com mais receitas
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