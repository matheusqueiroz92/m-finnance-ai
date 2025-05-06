import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AccountService } from '../../services/AccountService';
import Account from '../../models/AccountModel';
import User from '../../models/UserModel';
import Transaction from '../../models/TransactionModel';
import { ApiError } from '../../utils/ApiError';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Account.deleteMany({});
  await Transaction.deleteMany({});
});

describe('AccountService', () => {
  const accountService = new AccountService();
  
  describe('createAccount', () => {
    it('should create a new account', async () => {
      const accountData = {
        user: userId,
        name: 'Test Account',
        type: 'checking',
        balance: 1000,
        institution: 'Test Bank',
        accountNumber: '1234',
      };
      
      const account = await accountService.createAccount(accountData);
      
      expect(account).toBeDefined();
      expect(account.name).toBe('Test Account');
      expect(account.balance).toBe(1000);
      expect(account.user.toString()).toBe(userId.toString());
    });
  });
  
  describe('getAccountsByUserId', () => {
    beforeEach(async () => {
      // Create test accounts
      await Account.create([
        {
          user: userId,
          name: 'Checking Account',
          type: 'checking',
          balance: 1000,
          institution: 'Test Bank',
        },
        {
          user: userId,
          name: 'Savings Account',
          type: 'savings',
          balance: 2000,
          institution: 'Test Bank',
        },
      ]);
    });
    
    it('should get all accounts for a user', async () => {
      const accounts = await accountService.getAccountsByUserId(userId.toString());
      
      expect(accounts).toHaveLength(2);
      expect(accounts[0].name).toBe('Checking Account');
      expect(accounts[1].name).toBe('Savings Account');
    });
  });
  
  describe('getAccountById', () => {
    let accountId: string;
    
    beforeEach(async () => {
      const account = await Account.create({
        user: userId,
        name: 'Test Account',
        type: 'checking',
        balance: 1000,
        institution: 'Test Bank',
      });
      
      accountId = account._id.toString();
    });
    
    it('should get account by ID', async () => {
      const account = await accountService.getAccountById(accountId, userId.toString());
      
      expect(account).toBeDefined();
      expect(account._id.toString()).toBe(accountId);
      expect(account.name).toBe('Test Account');
    });
    
    it('should throw error if account not found', async () => {
      const invalidAccountId = new mongoose.Types.ObjectId().toString();
      
      await expect(accountService.getAccountById(
        invalidAccountId,
        userId.toString()
      )).rejects.toThrow(ApiError);
    });
  });
  
  describe('updateAccount', () => {
    let accountId: string;
    
    beforeEach(async () => {
      const account = await Account.create({
        user: userId,
        name: 'Test Account',
        type: 'checking',
        balance: 1000,
        institution: 'Test Bank',
      });
      
      accountId = account._id.toString();
    });
    
    it('should update account details', async () => {
      const updateData = {
        name: 'Updated Account',
        institution: 'New Bank',
      };
      
      const account = await accountService.updateAccount(
        accountId,
        userId.toString(),
        updateData
      );
      
      expect(account.name).toBe('Updated Account');
      expect(account.institution).toBe('New Bank');
      expect(account.balance).toBe(1000); // Balance should not change
    });
    
    it('should not update balance directly', async () => {
      const updateData = {
        balance: 2000, // This should be ignored
      };
      
      const account = await accountService.updateAccount(
        accountId,
        userId.toString(),
        updateData
      );
      
      expect(account.balance).toBe(1000); // Balance should not change
    });
  });
  
  describe('deleteAccount', () => {
    let accountId: string;
    
    beforeEach(async () => {
      const account = await Account.create({
        user: userId,
        name: 'Test Account',
        type: 'checking',
        balance: 1000,
        institution: 'Test Bank',
      });
      
      accountId = account._id.toString();
    });
    
    it('should delete an account', async () => {
      const result = await accountService.deleteAccount(
        accountId,
        userId.toString()
      );
      
      expect(result.success).toBe(true);
      
      const account = await Account.findById(accountId);
      expect(account).toBeNull();
    });
    
    it('should throw error if account has transactions', async () => {
      // Create a transaction using the account
      await Transaction.create({
        user: userId,
        account: accountId,
        category: new mongoose.Types.ObjectId(),
        amount: 100,
        type: 'expense',
        description: 'Test Expense',
        date: new Date(),
      });
      
      await expect(accountService.deleteAccount(
        accountId,
        userId.toString()
      )).rejects.toThrow(ApiError);
    });
  });
});