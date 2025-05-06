import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TransactionService } from '../../services/TransactionService';
import Transaction from '../../models/TransactionModel';
import Account from '../../models/AccountModel';
import User from '../../models/UserModel';
import Category from '../../models/CategoryModel';
import { ApiError } from '../../utils/ApiError';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;
let accountId: mongoose.Types.ObjectId;
let categoryId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  userId = user._id;
  
  // Create test account
  const account = await Account.create({
    user: userId,
    name: 'Test Account',
    type: 'checking',
    balance: 1000,
    institution: 'Test Bank',
  });
  accountId = account._id;
  
  // Create test category
  const category = await Category.create({
    user: userId,
    name: 'Test Category',
    type: 'expense',
  });
  categoryId = category._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Transaction.deleteMany({});
});

describe('TransactionService', () => {
  const transactionService = new TransactionService();
  
  describe('createTransaction', () => {
    it('should create a new income transaction and update account balance', async () => {
      const initialBalance = (await Account.findById(accountId))!.balance;
      
      const transactionData = {
        user: userId,
        account: accountId,
        category: categoryId,
        amount: 500,
        type: 'income',
        description: 'Test Income',
        date: new Date(),
      };
      
      const transaction = await transactionService.createTransaction(transactionData);
      
      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('income');
      expect(transaction.amount).toBe(500);
      
      const updatedAccount = await Account.findById(accountId);
      expect(updatedAccount!.balance).toBe(initialBalance + 500);
    });
    
    it('should create a new expense transaction and update account balance', async () => {
      const initialBalance = (await Account.findById(accountId))!.balance;
      
      const transactionData = {
        user: userId,
        account: accountId,
        category: categoryId,
        amount: 300,
        type: 'expense',
        description: 'Test Expense',
        date: new Date(),
      };
      
      const transaction = await transactionService.createTransaction(transactionData);
      
      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('expense');
      expect(transaction.amount).toBe(300);
      
      const updatedAccount = await Account.findById(accountId);
      expect(updatedAccount!.balance).toBe(initialBalance - 300);
    });
    
    it('should throw error if account not found', async () => {
      const invalidAccountId = new mongoose.Types.ObjectId();
      
      const transactionData = {
        user: userId,
        account: invalidAccountId,
        category: categoryId,
        amount: 500,
        type: 'income',
        description: 'Test Income',
        date: new Date(),
      };
      
      await expect(transactionService.createTransaction(transactionData)).rejects.toThrow(ApiError);
    });
  });
  
  describe('getUserTransactions', () => {
    beforeEach(async () => {
      // Create test transactions
      await Transaction.create([
        {
          user: userId,
          account: accountId,
          category: categoryId,
          amount: 100,
          type: 'expense',
          description: 'Test Expense 1',
          date: new Date('2025-01-01'),
        },
        {
          user: userId,
          account: accountId,
          category: categoryId,
          amount: 200,
          type: 'expense',
          description: 'Test Expense 2',
          date: new Date('2025-01-15'),
        },
        {
          user: userId,
          account: accountId,
          category: categoryId,
          amount: 300,
          type: 'income',
          description: 'Test Income',
          date: new Date('2025-01-20'),
        },
      ]);
    });
    
    it('should get all user transactions', async () => {
      const result = await transactionService.getUserTransactions(userId.toString(), {});
      
      expect(result.transactions).toHaveLength(3);
      expect(result.total).toBe(3);
    });
    
    it('should filter transactions by type', async () => {
      const result = await transactionService.getUserTransactions(userId.toString(), {
        type: 'expense',
      });
      
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].type).toBe('expense');
      expect(result.transactions[1].type).toBe('expense');
    });
    
    it('should filter transactions by date range', async () => {
      const result = await transactionService.getUserTransactions(userId.toString(), {
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-25'),
      });
      
      expect(result.transactions).toHaveLength(2);
    });
    
    it('should paginate results correctly', async () => {
      const result = await transactionService.getUserTransactions(userId.toString(), {
        limit: 2,
        page: 1,
      });
      
      expect(result.transactions).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(2);
      expect(result.total).toBe(3);
    });
  });
  
  describe('getTransactionById', () => {
    let transaction: any;
    
    beforeEach(async () => {
      transaction = await Transaction.create({
        user: userId,
        account: accountId,
        category: categoryId,
        amount: 100,
        type: 'expense',
        description: 'Test Expense',
        date: new Date(),
      });
    });
    
    it('should get transaction by ID', async () => {
      const result = await transactionService.getTransactionById(
        transaction._id.toString(),
        userId.toString()
      );
      
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(transaction._id.toString());
      expect(result.description).toBe('Test Expense');
    });
    
    it('should throw error if transaction not found', async () => {
      const invalidTransactionId = new mongoose.Types.ObjectId().toString();
      
      await expect(transactionService.getTransactionById(
        invalidTransactionId,
        userId.toString()
      )).rejects.toThrow(ApiError);
    });
  });
});