import { ApiError } from '../utils/ApiError';
import { AccountModelClass } from '../models/AccountModel';
import { AccountCreateInput, AccountUpdateInput } from '../validators/accountValidator';
import { TransactionModelClass } from '../models/TransactionModel';

export class AccountService {
  private accountModel: AccountModelClass;
  private transactionModel: TransactionModelClass;

  constructor() {
    this.accountModel = new AccountModelClass();
    this.transactionModel = new TransactionModelClass();
  }

  /**
   * Create a new account
   */
  async createAccount(userId: string, accountData: AccountCreateInput): Promise<any> {
    // Create account with user ID
    const newAccount = await this.accountModel.create({
      ...accountData,
      user: userId
    });
    
    return newAccount;
  }
  
  /**
   * Get accounts by user ID
   */
  async getAccountsByUserId(userId: string): Promise<any[]> {
    const accounts = await this.accountModel.findByUser(userId);
    return accounts;
  }
  
  /**
   * Get account by ID
   */
  async getAccountById(accountId: string, userId: string): Promise<any> {
    const account = await this.accountModel.findById(accountId, userId);
    
    if (!account) {
      throw new ApiError('Conta não encontrada', 404);
    }
    
    return account;
  }
  
  /**
   * Update an account
   */
  async updateAccount(accountId: string, userId: string, updateData: AccountUpdateInput): Promise<any> {
    // Prevent updating balance directly
    if ('balance' in updateData) {
      delete updateData.balance;
    }
    
    const updatedAccount = await this.accountModel.update(accountId, userId, updateData);
    
    if (!updatedAccount) {
      throw new ApiError('Conta não encontrada', 404);
    }
    
    return updatedAccount;
  }
  
  /**
   * Delete an account
   */
  async deleteAccount(accountId: string, userId: string): Promise<void> {
    // Check if account is in use by transactions
    const accountTransactions = await this.transactionModel.findByAccount(userId, accountId);
    
    if (accountTransactions.length > 0) {
      throw new ApiError('Não é possível excluir uma conta que possui transações', 400);
    }
    
    const result = await this.accountModel.delete(accountId, userId);
    
    if (!result) {
      throw new ApiError('Conta não encontrada', 404);
    }
  }
  
  /**
   * Get account summary with transaction stats
   */
  async getAccountSummary(userId: string): Promise<any> {
    const accounts = await this.accountModel.findByUser(userId);
    
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
      
      return {
        id: account._id,
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
}