import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

@injectable()
export class TransactionController {
  constructor(
    @inject('TransactionService')
    private transactionService: ITransactionService
  ) {}
  
  /**
   * Create a new transaction
   */
  createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { account, category, amount, type, description, date, isRecurring, recurrenceInterval, notes } = req.body;
      
      // Preparar dados da transação
      const transactionData = {
        account,
        category,
        amount,
        type,
        description,
        date: date || new Date(),
        isRecurring: isRecurring || false,
        recurrenceInterval,
        notes,
        attachments: req.files && Array.isArray(req.files) ? 
          (req.files as Express.Multer.File[]).map(file => file.path) : 
          undefined
      };
      
      const transaction = await this.transactionService.createTransaction(req.user._id, transactionData);
      
      ApiResponse.created(res, transaction, 'Transação criada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  getUserTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        type: req.query.type as 'income' | 'expense' | 'investment' | undefined,
        category: req.query.category as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        account: req.query.account as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      };
      
      const result = await this.transactionService.getUserTransactions(req.user._id, filters);
      
      ApiResponse.paginated(
        res, 
        result.transactions,
        result.page,
        result.limit,
        result.total,
        'Transações recuperadas com sucesso'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get transaction by ID
   */
  getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError('ID da transação é obrigatório', 400);
      }
      
      const transaction = await this.transactionService.getTransactionById(
        req.params.id,
        req.user._id
      );
      
      ApiResponse.success(res, transaction, 'Transação recuperada com sucesso');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a transaction
   */
  updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError('ID da transação é obrigatório', 400);
      }
      
      const { account, category, amount, type, description, date, isRecurring, recurrenceInterval, notes } = req.body;
      
      const updateData = {
        account,
        category,
        amount,
        type,
        description,
        date,
        isRecurring,
        recurrenceInterval,
        notes,
        // Tratar anexos apenas se houver arquivos no request
        attachments: req.files && Array.isArray(req.files) ? 
          (req.files as Express.Multer.File[]).map(file => file.path) : 
          undefined
      };
      
      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const transaction = await this.transactionService.updateTransaction(
        req.params.id,
        req.user._id,
        updateData
      );
      
      ApiResponse.success(res, transaction, 'Transação atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a transaction
   */
  deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new ApiError('ID da transação é obrigatório', 400);
      }
      
      const result = await this.transactionService.deleteTransaction(
        req.params.id,
        req.user._id
      );
      
      ApiResponse.success(res, result, 'Transação excluída com sucesso');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get transaction statistics
   */
  getTransactionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      
      const stats = await this.transactionService.getTransactionStats(req.user._id, period);
      
      ApiResponse.success(res, stats, 'Estatísticas recuperadas com sucesso');
    } catch (error) {
      next(error);
    }
  };
}