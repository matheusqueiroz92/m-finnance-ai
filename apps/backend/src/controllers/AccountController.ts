import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAccountService } from '../interfaces/services/IAccountService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

@injectable()
export class AccountController {
  constructor(
    @inject('AccountService')
    private accountService: IAccountService
  ) {}
  
  /**
   * Create a new account
   */
  createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, type, balance, institution, accountNumber } = req.body;
      
      const accountData = {
        name,
        type,
        balance: balance || 0,
        institution,
        accountNumber,
        isActive: true,
      };
      
      const account = await this.accountService.createAccount(req.user._id, accountData);
      
      ApiResponse.created(res, account, 'Conta criada com sucesso');
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
      
      ApiResponse.success(res, accounts, 'Contas recuperadas com sucesso');
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
        throw new ApiError('ID da conta é obrigatório', 400);
      }
      
      const account = await this.accountService.getAccountById(
        req.params.id,
        req.user._id
      );
      
      ApiResponse.success(res, account, 'Conta recuperada com sucesso');
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
        throw new ApiError('ID da conta é obrigatório', 400);
      }
      
      const { name, institution, accountNumber, isActive } = req.body;
      
      const updateData = {
        name,
        institution,
        accountNumber,
        isActive,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const account = await this.accountService.updateAccount(
        req.params.id,
        req.user._id,
        updateData
      );
      
      ApiResponse.success(res, account, 'Conta atualizada com sucesso');
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
        throw new ApiError('ID da conta é obrigatório', 400);
      }
      
      await this.accountService.deleteAccount(
        req.params.id,
        req.user._id
      );
      
      ApiResponse.success(res, { success: true }, 'Conta excluída com sucesso');
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
      
      ApiResponse.success(res, summary, 'Resumo das contas recuperado com sucesso');
    } catch (error) {
      next(error);
    }
  };
}