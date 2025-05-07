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
      const { 
        account, 
        category, 
        amount, 
        type, 
        description, 
        date, 
        isRecurring, 
        recurrenceInterval, 
        notes,
        fileType,
        fileDescription
      } = req.body;
      
      // Definir o tipo para incluir attachments
      const transactionData: any = {
        account,
        category,
        amount,
        type,
        description,
        date: date || new Date(),
        isRecurring: isRecurring || false,
        recurrenceInterval,
        notes
      };
      
      // Processar os uploads de arquivos com metadados
      if (req.files && Array.isArray(req.files)) {
        const attachmentType = fileType || 'receipt'; // Valor padrão
        const attachmentDescription = fileDescription || ''; // Valor padrão
        
        transactionData.attachments = (req.files as Express.Multer.File[]).map(
          (file) => ({
            path: file.path.replace(/\\/g, '/'),
            type: attachmentType,
            description: attachmentDescription,
            uploadedAt: new Date()
          })
        );
      }
      
      const transaction = await this.transactionService.createTransaction(req.user._id, transactionData);
      
      ApiResponse.created(res, transaction, 'Transação criada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get all transactions for the user
   */
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
      
      const { 
        account, 
        category, 
        amount, 
        type, 
        description, 
        date, 
        isRecurring, 
        recurrenceInterval, 
        notes,
        fileType,
        fileDescription,
        keepExistingAttachments
      } = req.body;
      
      // Definir o tipo para incluir attachments
      const updateData: any = {
        account,
        category,
        amount,
        type,
        description,
        date,
        isRecurring,
        recurrenceInterval,
        notes
      };
      
      // Remover campos indefinidos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      // Processar os uploads de arquivos com metadados
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const attachmentType = fileType || 'receipt'; // Valor padrão
        const attachmentDescription = fileDescription || ''; // Valor padrão
        
        const newAttachments = (req.files as Express.Multer.File[]).map(
          (file) => ({
            path: file.path.replace(/\\/g, '/'),
            type: attachmentType,
            description: attachmentDescription,
            uploadedAt: new Date()
          })
        );
        
        // Verificar se deve manter os anexos existentes ou substituí-los
        const shouldKeepExistingAttachments = keepExistingAttachments === 'true';
        
        if (shouldKeepExistingAttachments) {
          // Buscar a transação atual para obter os anexos existentes
          const currentTransaction = await this.transactionService.getTransactionById(
            req.params.id,
            req.user._id
          );
          
          // Combinar anexos existentes com os novos
          updateData.attachments = [
            ...(currentTransaction.attachments || []),
            ...newAttachments
          ];
        } else {
          // Substituir anexos existentes pelos novos
          updateData.attachments = newAttachments;
        }
      }
      
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

  /**
   * 
   * Remove an attachment from a transaction
   */
  removeAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { transactionId, attachmentId } = req.params;
      
      if (!transactionId || !attachmentId) {
        throw new ApiError('ID da transação e do anexo são obrigatórios', 400);
      }
      
      const transaction = await this.transactionService.removeAttachment(
        transactionId,
        req.user._id,
        attachmentId
      );
      
      ApiResponse.success(res, transaction, 'Anexo removido com sucesso');
    } catch (error) {
      next(error);
    }
  };
}