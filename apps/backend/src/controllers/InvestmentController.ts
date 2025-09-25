import { Request, Response, NextFunction } from 'express';
import { injectable, inject, container } from 'tsyringe';
import { IInvestmentService } from '../interfaces/services/IInvestmentService';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { ZodError } from 'zod';
import { investmentCreateSchema, investmentUpdateSchema, investmentFilterSchema } from '../validators/investmentValidator';

@injectable()
export class InvestmentController {
  constructor(
    @inject('InvestmentService')
    private investmentService: IInvestmentService
  ) {}
  
  /**
   * Create a new investment
   */
  createInvestment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      console.log('Dados recebidos para criação de investimento:', req.body);
      
      // Preparar os dados para validação
      const investmentData = {
        name: req.body.name,
        type: req.body.type,
        symbol: req.body.symbol,
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        initialValue: req.body.initialValue ? parseFloat(req.body.initialValue) : undefined,
        currentValue: req.body.currentValue ? parseFloat(req.body.currentValue) : undefined,
        acquisitionDate: req.body.acquisitionDate,
        notes: req.body.notes,
        provider: req.body.provider,
        account: req.body.account
      };
      
      console.log('Dados preparados para validação:', investmentData);
      
      // Validar os dados
      try {
        const validatedData = investmentCreateSchema.parse(investmentData);
        console.log('Dados validados com sucesso:', validatedData);
        
        const investment = await this.investmentService.createInvestment((req.user as any)._id, validatedData);
        
        ApiResponse.created(res, investment, 'Investimento criado com sucesso');
      } catch (validationError) {
        console.error('Erro de validação:', validationError);
        
        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map(err => ({
            field: err.path.join('.') || 'dados',
            message: `Campo ${err.path.join('.') || 'desconhecido'}: ${err.message}`
          }));
          
          throw new ApiError('Erro de validação dos dados do investimento', 400, formattedErrors);
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      next(error);
    }
  };
  
  /**
   * Get all investments for the user
   */
  getInvestments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      console.log('Parâmetros de consulta para investimentos:', req.query);
      
      // Validar os filtros
      try {
        const validatedFilters = investmentFilterSchema.parse(req.query);
        console.log('Filtros validados:', validatedFilters);
        
        const result = await this.investmentService.getInvestmentsByUserId(
          (req.user as any)._id, 
          validatedFilters
        );
        
        ApiResponse.paginated(
          res, 
          result.investments,
          result.page,
          result.limit,
          result.total,
          'Investimentos recuperados com sucesso'
        );
      } catch (validationError) {
        console.error('Erro de validação nos filtros:', validationError);
        
        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map(err => ({
            field: err.path.join('.') || 'filtro',
            message: `Filtro ${err.path.join('.') || 'desconhecido'}: ${err.message}`
          }));
          
          throw new ApiError('Erro de validação nos filtros', 400, formattedErrors);
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get investment by ID
   */
  getInvestmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do investimento é obrigatório', 400);
      }
      
      const investment = await this.investmentService.getInvestmentById(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, investment, 'Investimento recuperado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update an investment
   */
  updateInvestment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do investimento é obrigatório', 400);
      }
      
      console.log('Dados recebidos para atualização de investimento:', req.body);
      
      // Preparar os dados para validação
      const updateData = {
        name: req.body.name,
        type: req.body.type,
        symbol: req.body.symbol,
        amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : undefined,
        currentValue: req.body.currentValue !== undefined ? parseFloat(req.body.currentValue) : undefined,
        notes: req.body.notes,
        isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : undefined,
        provider: req.body.provider
      };
      
      // Remover campos undefined para não sobrescrever dados existentes
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      console.log('Dados preparados para validação de atualização:', updateData);
      
      // Validar os dados
      try {
        const validatedData = investmentUpdateSchema.parse(updateData);
        console.log('Dados de atualização validados com sucesso:', validatedData);
        
        const investment = await this.investmentService.updateInvestment(
          req.params.id,
          (req.user as any)._id,
          validatedData
        );
        
        ApiResponse.success(res, investment, 'Investimento atualizado com sucesso');
      } catch (validationError) {
        console.error('Erro de validação na atualização:', validationError);
        
        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map(err => ({
            field: err.path.join('.') || 'dados',
            message: `Campo ${err.path.join('.') || 'desconhecido'}: ${err.message}`
          }));
          
          throw new ApiError('Erro de validação dos dados de atualização', 400, formattedErrors);
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      next(error);
    }
  };
  
  /**
   * Delete an investment
   */
  deleteInvestment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do investimento é obrigatório', 400);
      }
      
      await this.investmentService.deleteInvestment(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, { success: true }, 'Investimento excluído com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get investment summary
   */
  getInvestmentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const summary = await this.investmentService.getInvestmentSummary((req.user as any)._id);
      
      ApiResponse.success(res, summary, 'Resumo de investimentos recuperado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get investments by account
   */
  getInvestmentsByAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.accountId) {
        throw new ApiError('ID da conta é obrigatório', 400);
      }
      
      const investments = await this.investmentService.getInvestmentsByAccount(
        (req.user as any)._id,
        req.params.accountId
      );
      
      ApiResponse.success(res, investments, 'Investimentos da conta recuperados com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get transactions by investment
   */
  getTransactionsByInvestment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do investimento é obrigatório', 400);
      }
      
      const transactionService = container.resolve<ITransactionService>('TransactionService');
      const transactions = await transactionService.getTransactionsByInvestment(
        (req.user as any)._id,
        req.params.id
      );
      
      ApiResponse.success(res, transactions, 'Transações do investimento recuperadas com sucesso');
    } catch (error) {
      next(error);
    }
  };
}