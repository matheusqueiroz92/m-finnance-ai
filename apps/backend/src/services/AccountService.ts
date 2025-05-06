import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IAccountService } from '../interfaces/services/IAccountService';
import { IAccountRepository } from '../interfaces/repositories/IAccountRepository';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { 
  IAccountCreateDTO, 
  IAccountUpdateDTO, 
  IAccountDTO, 
  IAccountSummary,
  IAccount
} from '../interfaces/entities/IAccount';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class AccountService implements IAccountService {
  constructor(
    @inject('AccountRepository')
    private accountRepository: IAccountRepository,
    @inject('TransactionRepository')
    private transactionRepository: ITransactionRepository
  ) {}

  /**
   * Create a new account
   */
  async createAccount(userId: string, accountData: IAccountCreateDTO): Promise<IAccountDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Prepare account data with user ID
      const newAccount = {
        ...accountData,
        user: new mongoose.Types.ObjectId(userId),
        balance: accountData.balance || 0,
        isActive: accountData.isActive !== undefined ? accountData.isActive : true
      };
      
      // Create account
      const account = await this.accountRepository.create(newAccount, { session });
      
      if (!account) {
        throw new ApiError('Falha ao criar conta', 500);
      }
      
      return this.mapToDTO(account);
    });
  }
  
  /**
   * Get accounts by user ID
   */
  async getAccountsByUserId(userId: string): Promise<IAccountDTO[]> {
    const accounts = await this.accountRepository.findByUser(userId);
    return accounts.map(account => this.mapToDTO(account));
  }
  
  /**
   * Get account by ID
   */
  async getAccountById(accountId: string, userId: string): Promise<IAccountDTO> {
    const account = await this.accountRepository.findById(accountId, userId);
    
    if (!account) {
      throw new ApiError('Conta não encontrada', 404);
    }
    
    return this.mapToDTO(account);
  }
  
  /**
   * Update an account
   */
  async updateAccount(accountId: string, userId: string, updateData: IAccountUpdateDTO): Promise<IAccountDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Prevent updating balance directly
      if ('balance' in updateData) {
        delete (updateData as any).balance;
      }
      
      const updatedAccount = await this.accountRepository.update(accountId, userId, updateData, { session });
      
      if (!updatedAccount) {
        throw new ApiError('Conta não encontrada', 404);
      }
      
      return this.mapToDTO(updatedAccount);
    });
  }
  
  /**
   * Delete an account
   */
  async deleteAccount(accountId: string, userId: string): Promise<void> {
    // Check if account is in use by transactions
    const accountTransactions = await this.transactionRepository.findByAccount(userId, accountId);
    
    if (accountTransactions.length > 0) {
      throw new ApiError('Não é possível excluir uma conta que possui transações', 400);
    }
    
    const result = await this.accountRepository.delete(accountId, userId);
    
    if (!result) {
      throw new ApiError('Conta não encontrada', 404);
    }
  }
  
  /**
   * Get account summary with transaction stats
   */
  async getAccountSummary(userId: string): Promise<IAccountSummary> {
    const accounts = await this.accountRepository.findByUser(userId);
    
    let totalBalance = 0;
    let totalPositiveBalance = 0;
    let totalNegativeBalance = 0;
    
    const accountsWithBalance = accounts.map(account => {
      if (account.balance > 0) {
        totalPositiveBalance += account.balance;
      } else if (account.balance < 0) {
        totalNegativeBalance += account.balance;
      }
      
      totalBalance += account.balance;
      
      // Garantir que _id existe e convertê-lo para string
      const id = account._id?.toString() || '';
      
      return {
        id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        institution: account.institution,
      };
    });
    
    return {
      accounts: accountsWithBalance,
      summary: {
        totalBalance,
        totalPositiveBalance,
        totalNegativeBalance,
        accountCount: accounts.length,
      },
    };
  }
  
  /**
   * Map Account model to DTO
   */
  private mapToDTO(account: IAccount): IAccountDTO {
    // Garantir que _id existe e convertê-lo para string
    const id = account._id?.toString() || '';
    
    return {
      _id: id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      institution: account.institution,
      accountNumber: account.accountNumber,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
}