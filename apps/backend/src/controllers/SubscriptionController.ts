import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { ISubscriptionService } from '../interfaces/services/ISubscriptionService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { SubscriptionPlanType } from '../interfaces/entities/ISubscription';

@injectable()
export class SubscriptionController {
  constructor(
    @inject('SubscriptionService')
    private subscriptionService: ISubscriptionService
  ) {}
  
  /**
   * Get the current user's subscription
   */
  getCurrentSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const subscription = await this.subscriptionService.getUserSubscription((req.user as any)._id);
      
      if (!subscription) {
        ApiResponse.success(res, null, 'Usuário não possui assinatura');
        return;
      }
      
      ApiResponse.success(res, subscription, 'Assinatura recuperada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Create a trial subscription for the user
   */
  startTrial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const subscription = await this.subscriptionService.createTrialSubscription((req.user as any)._id);
      
      ApiResponse.created(res, subscription, 'Período de teste iniciado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Cancel the current subscription
   */
  cancelSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const subscription = await this.subscriptionService.cancelSubscription((req.user as any)._id);
      
      ApiResponse.success(res, subscription, 'Assinatura cancelada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update subscription to a new plan type
   */
  updateSubscriptionPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const { planType } = req.body;
      
      if (!planType || !Object.values(SubscriptionPlanType).includes(planType)) {
        throw new ApiError('Tipo de plano inválido', 400);
      }
      
      const subscription = await this.subscriptionService.updateSubscription((req.user as any)._id, { planType });
      
      ApiResponse.success(res, subscription, 'Plano atualizado com sucesso');
    } catch (error) {
      next(error);
    }
  };
}