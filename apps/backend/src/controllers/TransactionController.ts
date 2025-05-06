import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/TransactionService';

export class TransactionController {
  private transactionService: TransactionService;
  
  constructor() {
    this.transactionService = new TransactionService();
  }
  
  /**
   * Create a new transaction
   */
  createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { account, category, amount, type, description, date, isRecurring, recurrenceInterval, notes } = req.body;
      
      const transactionData: {
        user: any;
        account: any;
        category: any;
        amount: any;
        type: any;
        description: any;
        date: any;
        isRecurring: any;
        recurrenceInterval: any;
        notes: any;
        attachments?: string[];
      } = {
        user: req.user._id,
        account,
        category,
        amount,
        type,
        description,
        date: date || new Date(),
        isRecurring: isRecurring || false,
        recurrenceInterval,
        notes,
      };
      
      // Handle file uploads if any
      if (req.files && Array.isArray(req.files)) {
        transactionData.attachments = (req.files as Express.Multer.File[]).map(
          (file) => file.path
        );
      }
      
      const transaction = await this.transactionService.createTransaction(req.user._id, transactionData);
      
      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get user transactions with filters
   */
  getUserTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        type: req.query.type as "income" | "expense" | "investment" | undefined,
        category: req.query.category as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        account: req.query.account as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      };
      
      const result = await this.transactionService.getUserTransactions(req.user._id, filters);
      
      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get transaction by ID
   */
  getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.getTransactionById(
        req.params.id!,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a transaction
   */
  updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { account, category, amount, type, description, date, isRecurring, recurrenceInterval, notes } = req.body;
      
      const updateData: any = {
        account,
        category,
        amount,
        type,
        description,
        date,
        isRecurring,
        recurrenceInterval,
        notes,
      };
      
      // Handle file uploads if any
      if (req.files && Array.isArray(req.files)) {
        updateData.attachments = (req.files as Express.Multer.File[]).map(
          (file) => file.path
        );
      }
      
      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );
      
      const transaction = await this.transactionService.updateTransaction(
        req.params.id!,
        req.user._id,
        updateData
      );
      
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a transaction
   */
  deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.transactionService.deleteTransaction(
        req.params.id!,
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
   * Get transaction statistics
   */
  getTransactionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      
      const stats = await this.transactionService.getTransactionStats(req.user._id, period);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}