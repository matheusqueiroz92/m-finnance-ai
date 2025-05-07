import { injectable, inject } from 'tsyringe';
import { 
  ISubscriptionService 
} from '../interfaces/services/ISubscriptionService';
import { ISubscriptionRepository } from '../interfaces/repositories/ISubscriptionRepository';
import { 
  ISubscriptionDTO,
  ICreateSubscriptionDTO,
  IUpdateSubscriptionDTO,
  SubscriptionPlanType,
  SubscriptionStatus,
  ISubscription 
} from '../interfaces/entities/ISubscription';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';
import mongoose from 'mongoose';

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject('SubscriptionRepository')
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(userId: string, subscriptionData: ICreateSubscriptionDTO): Promise<ISubscriptionDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Check if user already has a subscription
      const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (existingSubscription) {
        throw new ApiError('Usuário já possui uma assinatura', 400);
      }
      
      // Set default dates if not provided
      const startDate = subscriptionData.startDate || new Date();
      
      // Default end date is 1 month from start date for premium
      let endDate = subscriptionData.endDate;
      if (!endDate) {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      // Create subscription
      const newSubscription = {
        user: new mongoose.Types.ObjectId(userId),
        planType: subscriptionData.planType,
        status: subscriptionData.planType === SubscriptionPlanType.PREMIUM 
          ? SubscriptionStatus.ACTIVE 
          : SubscriptionStatus.TRIAL,
        startDate,
        endDate,
        trialEndsAt: subscriptionData.trialEndsAt,
        cancelAtPeriodEnd: false
      };
      
      const subscription = await this.subscriptionRepository.create(newSubscription, { session });
      
      if (!subscription) {
        throw new ApiError('Falha ao criar assinatura', 500);
      }
      
      return this.mapToDTO(subscription);
    });
  }
  
  /**
   * Get subscription by user ID
   */
  async getUserSubscription(userId: string): Promise<ISubscriptionDTO | null> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    
    if (!subscription) {
      return null;
    }
    
    return this.mapToDTO(subscription);
  }
  
  /**
   * Update a subscription
   */
  async updateSubscription(userId: string, updateData: IUpdateSubscriptionDTO): Promise<ISubscriptionDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (!subscription) {
        throw new ApiError('Assinatura não encontrada', 404);
      }
      
      const updatedSubscription = await this.subscriptionRepository.update(userId, updateData, { session });
      
      if (!updatedSubscription) {
        throw new ApiError('Falha ao atualizar assinatura', 500);
      }
      
      return this.mapToDTO(updatedSubscription);
    });
  }
  
  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string): Promise<ISubscriptionDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (!subscription) {
        throw new ApiError('Assinatura não encontrada', 404);
      }
      
      const updateData = {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: true
      };
      
      const updatedSubscription = await this.subscriptionRepository.update(userId, updateData, { session });
      
      if (!updatedSubscription) {
        throw new ApiError('Falha ao cancelar assinatura', 500);
      }
      
      return this.mapToDTO(updatedSubscription);
    });
  }
  
  /**
   * Create a free subscription
   */
  async createFreeSubscription(userId: string): Promise<ISubscriptionDTO> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100); // Long expiry for free plan
    
    const subscriptionData: ICreateSubscriptionDTO = {
      planType: SubscriptionPlanType.FREE,
      startDate,
      endDate
    };
    
    return this.createSubscription(userId, subscriptionData);
  }
  
  /**
   * Create a trial subscription
   */
  async createTrialSubscription(userId: string): Promise<ISubscriptionDTO> {
    const startDate = new Date();
    
    // Trial ends in 30 days
    const trialEndsAt = new Date(startDate);
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    
    // End date is same as trial end date
    const endDate = new Date(trialEndsAt);
    
    const subscriptionData: ICreateSubscriptionDTO = {
      planType: SubscriptionPlanType.PREMIUM,
      startDate,
      endDate,
      trialEndsAt
    };
    
    return TransactionManager.executeInTransaction(async (session) => {
      // Check if user already has a subscription
      const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (existingSubscription) {
        throw new ApiError('Usuário já possui uma assinatura', 400);
      }
      
      // Create subscription with trial status
      const newSubscription = {
        user: new mongoose.Types.ObjectId(userId),
        planType: SubscriptionPlanType.PREMIUM,
        status: SubscriptionStatus.TRIAL,
        startDate,
        endDate,
        trialEndsAt,
        cancelAtPeriodEnd: false
      };
      
      const subscription = await this.subscriptionRepository.create(newSubscription, { session });
      
      if (!subscription) {
        throw new ApiError('Falha ao criar assinatura de teste', 500);
      }
      
      return this.mapToDTO(subscription);
    });
  }
  
  /**
   * Check if user has an active premium subscription
   */
  async isPremiumUser(userId: string): Promise<boolean> {
    return this.subscriptionRepository.checkActivePremium(userId);
  }
  
  /**
   * Process expired subscriptions
   */
  async processExpiredSubscriptions(): Promise<void> {
    await this.subscriptionRepository.processExpiredSubscriptions();
  }
  
  /**
   * Map Subscription model to DTO
   */
  private mapToDTO(subscription: ISubscription): ISubscriptionDTO {
    return {
      _id: subscription._id?.toString() || '',
      planType: subscription.planType,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEndsAt: subscription.trialEndsAt,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    };
  }
}