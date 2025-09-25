import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { ISubscriptionService } from '../interfaces/services/ISubscriptionService';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export const requirePremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscriptionService = container.resolve<ISubscriptionService>('SubscriptionService');
    
    if (!req.user) {
    ApiResponse.error(res, 'Usuário não autenticado', 401);
    return;
  }

  const isPremium = await subscriptionService.isPremiumUser((req.user as any)._id);
    
    if (!isPremium) {
      throw new ApiError('Esta funcionalidade requer uma assinatura premium', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};