import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { transactionCreateSchema, transactionUpdateSchema } from '../validators/transactionValidator';
import { ZodError } from 'zod';

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
      console.log('Dados recebidos no controller:', req.body);
      console.log('Arquivos recebidos:', req.files);
      
      // Preparar os dados para validação
      const transactionData = {
        account: req.body.account,
        category: req.body.category,
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        type: req.body.type,
        description: req.body.description,
        date: req.body.date || new Date().toISOString(),
        isRecurring: req.body.isRecurring === 'true',
        recurrenceInterval: req.body.recurrenceInterval,
        notes: req.body.notes,
        fileType: req.body.fileType,
        fileDescription: req.body.fileDescription
      };
      
      console.log('Dados preparados para validação:', transactionData);
      
      // Validar os dados manualmente
      try {
        // Usar o schema Zod para validação
        const validatedData = transactionCreateSchema.parse(transactionData);
        console.log('Dados validados com sucesso:', validatedData);
        
        // Preparar os dados para criação da transação
        const finalTransactionData: any = {
          ...validatedData,
          // Remover campos que não devem ir para o serviço
          fileType: undefined,
          fileDescription: undefined
        };
        
        // Remover campos undefined
        Object.keys(finalTransactionData).forEach(key => {
          if (finalTransactionData[key] === undefined) {
            delete finalTransactionData[key];
          }
        });
        
        // Processar os uploads de arquivos com metadados
        if (req.files && Array.isArray(req.files)) {
          const attachmentType = req.body.fileType || 'receipt'; // Valor padrão
          const attachmentDescription = req.body.fileDescription || ''; // Valor padrão
          
          finalTransactionData.attachments = (req.files as Express.Multer.File[]).map(
            (file) => ({
              path: file.path.replace(/\\/g, '/'),
              type: attachmentType,
              description: attachmentDescription,
              uploadedAt: new Date()
            })
          );
        }
        
        console.log('Dados finais para criação da transação:', finalTransactionData);
        
        const transaction = await this.transactionService.createTransaction(req.user._id, finalTransactionData);
        
        ApiResponse.created(res, transaction, 'Transação criada com sucesso');
      } catch (validationError) {
        console.error('Erro de validação:', validationError);
        
        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map(err => ({
            field: err.path.join('.') || 'dados',
            message: `Campo ${err.path.join('.') || 'desconhecido'}: ${err.message}`
          }));
          
          throw new ApiError('Erro de validação dos dados da transação', 400, formattedErrors);
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
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
      
      console.log('Dados recebidos para atualização:', req.body);
      console.log('Arquivos recebidos:', req.files);
      
      // Preparar os dados para validação
      const updateData: any = {
        account: req.body.account,
        category: req.body.category,
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        type: req.body.type,
        description: req.body.description,
        date: req.body.date,
        isRecurring: req.body.isRecurring === 'true' ? true : 
                    req.body.isRecurring === 'false' ? false : undefined,
        recurrenceInterval: req.body.recurrenceInterval,
        notes: req.body.notes
      };
      
      // Remover campos undefined para não sobrescrever dados existentes
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      console.log('Dados preparados para validação:', updateData);
      
      // Validar os dados manualmente
      try {
        // Usar o schema Zod para validação
        const validatedData = transactionUpdateSchema.parse(updateData) as typeof updateData & { attachments?: { path: string; type: string; description: string; uploadedAt: Date }[] };
        console.log('Dados validados com sucesso:', validatedData);
        
        // Processar os uploads de arquivos com metadados
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          const attachmentType = req.body.fileType || 'receipt'; // Valor padrão
          const attachmentDescription = req.body.fileDescription || ''; // Valor padrão
          
          const newAttachments = (req.files as Express.Multer.File[]).map(
            (file) => ({
              path: file.path.replace(/\\/g, '/'),
              type: attachmentType,
              description: attachmentDescription,
              uploadedAt: new Date()
            })
          );
          
          // Verificar se deve manter os anexos existentes ou substituí-los
          const shouldKeepExistingAttachments = req.body.keepExistingAttachments === 'true';
          
          if (shouldKeepExistingAttachments) {
            // Buscar a transação atual para obter os anexos existentes
            const currentTransaction = await this.transactionService.getTransactionById(
              req.params.id,
              req.user._id
            );
            
            // Combinar anexos existentes com os novos
            validatedData.attachments = [
              ...(currentTransaction.attachments || []),
              ...newAttachments
            ];
          } else {
            // Substituir anexos existentes pelos novos
            validatedData.attachments = newAttachments;
          }
        }
        
        console.log('Dados finais para atualização da transação:', validatedData);
        
        const transaction = await this.transactionService.updateTransaction(
          req.params.id,
          req.user._id,
          validatedData
        );
        
        ApiResponse.success(res, transaction, 'Transação atualizada com sucesso');
      } catch (validationError) {
        console.error('Erro de validação:', validationError);
        
        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map(err => ({
            field: err.path.join('.') || 'dados',
            message: `Campo ${err.path.join('.') || 'desconhecido'}: ${err.message}`
          }));
          
          throw new ApiError('Erro de validação dos dados da transação', 400, formattedErrors);
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
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