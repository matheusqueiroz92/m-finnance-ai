import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { ISubscriptionService } from '../interfaces/services/ISubscriptionService';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export const requirePremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Verifica se o usuário está autenticado
  try {
    const subscriptionService = container.resolve<ISubscriptionService>('SubscriptionService');
    
    // Se o usuário não está autenticado, retorna um erro 401
    if (!req.user) {
      ApiResponse.error(res, 'Usuário não autenticado', 401);
      return;
    } 
      
    // Verifica se o usuário é premium
    const isPremium = await subscriptionService.isPremiumUser((req.user as any)._id);
    
    // Se o usuário não é premium, retorna um erro 403
    if (!isPremium) {
      throw new ApiError('Esta funcionalidade requer uma assinatura premium', 403);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};