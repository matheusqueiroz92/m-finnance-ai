import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/AccountService';

export class AccountController {
  private accountService: AccountService;
  
  constructor() {
    this.accountService = new AccountService();
  }
  
  /**
   * Create a new account
   */
  createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, type, balance, institution, accountNumber } = req.body;
      
      const accountData = {
        user: req.user._id,
        name,
        type,
        balance: balance || 0,
        institution,
        accountNumber,
        isActive: true,
      };
      
      const account = await this.accountService.createAccount(req.user._id, accountData);
      
      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get accounts for the authenticated user
   */
  getAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accounts = await this.accountService.getAccountsByUserId(req.user._id);
      
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get account by ID
   */
  getAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new Error('Account ID is required');
      }
      
      const account = await this.accountService.getAccountById(
        req.params.id,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update an account
   */
  updateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new Error('Account ID is required');
      }
      
      const { name, institution, accountNumber, isActive } = req.body;
      
      const updateData: Record<string, any> = {
        name,
        institution,
        accountNumber,
        isActive,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );
      
      const account = await this.accountService.updateAccount(
        req.params.id,
        req.user._id,
        updateData
      );
      
      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete an account
   */
  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new Error('Account ID is required');
      }
      
      const result = await this.accountService.deleteAccount(
        req.params.id,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get account summary with transaction stats
   */
  getAccountSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.accountService.getAccountSummary(req.user._id);
      
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}