import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { ISubscriptionService } from '../interfaces/services/ISubscriptionService';
import { ApiError } from '../utils/ApiError';

export const requirePremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscriptionService = container.resolve<ISubscriptionService>('SubscriptionService');
    
    const isPremium = await subscriptionService.isPremiumUser(req.user._id);
    
    if (!isPremium) {
      throw new ApiError('Esta funcionalidade requer uma assinatura premium', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};