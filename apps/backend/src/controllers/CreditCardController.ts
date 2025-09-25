import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ICreditCardService } from '../interfaces/services/ICreditCardService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

@injectable()
export class CreditCardController {
  constructor(
    @inject('CreditCardService')
    private creditCardService: ICreditCardService
  ) {}
  
  /**
   * Create a new credit card
   */
  createCreditCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const {
        cardNumber,
        cardBrand,
        cardholderName,
        cardholderCpf,
        expiryDate,
        securityCode,
        creditLimit,
        billingDueDay
      } = req.body;
      
      const creditCardData = {
        cardNumber,
        cardBrand,
        cardholderName,
        cardholderCpf,
        expiryDate,
        securityCode,
        creditLimit,
        billingDueDay
      };
      
      const creditCard = await this.creditCardService.createCreditCard((req.user as any)._id, creditCardData);
      
      ApiResponse.created(res, creditCard, 'Cartão de crédito criado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get credit cards for the authenticated user
   */
  getCreditCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const isActive = req.query.isActive !== undefined 
        ? req.query.isActive === 'true' 
        : undefined;
      
      const creditCards = await this.creditCardService.getCreditCardsByUserId((req.user as any)._id, isActive);
      
      ApiResponse.success(res, creditCards, 'Cartões de crédito recuperados com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get credit card by ID
   */
  getCreditCardById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do cartão é obrigatório', 400);
      }
      
      const creditCard = await this.creditCardService.getCreditCardById(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, creditCard, 'Cartão de crédito recuperado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a credit card
   */
  updateCreditCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do cartão é obrigatório', 400);
      }
      
      const {
        cardholderName,
        expiryDate,
        securityCode,
        creditLimit,
        billingDueDay,
        isActive
      } = req.body;
      
      const updateData = {
        cardholderName,
        expiryDate,
        securityCode,
        creditLimit,
        billingDueDay,
        isActive
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const creditCard = await this.creditCardService.updateCreditCard(
        req.params.id,
        (req.user as any)._id,
        updateData
      );
      
      ApiResponse.success(res, creditCard, 'Cartão de crédito atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a credit card
   */
  deleteCreditCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do cartão é obrigatório', 400);
      }
      
      await this.creditCardService.deleteCreditCard(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, { success: true }, 'Cartão de crédito excluído com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get credit card balance
   */
  getCreditCardBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do cartão é obrigatório', 400);
      }
      
      const balance = await this.creditCardService.getCreditCardBalance(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, balance, 'Saldo do cartão recuperado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Validate security code
   */
  validateSecurityCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID do cartão é obrigatório', 400);
      }
      
      const { securityCode } = req.body;
      
      if (!securityCode) {
        throw new ApiError('Código de segurança é obrigatório', 400);
      }
      
      const isValid = await this.creditCardService.validateSecurityCode(
        req.params.id,
        (req.user as any)._id,
        securityCode
      );
      
      ApiResponse.success(res, { isValid }, 'Código de segurança validado');
    } catch (error) {
      next(error);
    }
  };
}