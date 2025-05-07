import { 
    ISubscriptionDTO, 
    ICreateSubscriptionDTO,
    IUpdateSubscriptionDTO,
    SubscriptionStatus 
  } from '../entities/ISubscription';
  
  export interface ISubscriptionService {
    createSubscription(userId: string, subscriptionData: ICreateSubscriptionDTO): Promise<ISubscriptionDTO>;
    getUserSubscription(userId: string): Promise<ISubscriptionDTO | null>;
    updateSubscription(userId: string, updateData: IUpdateSubscriptionDTO): Promise<ISubscriptionDTO>;
    cancelSubscription(userId: string): Promise<ISubscriptionDTO>;
    createFreeSubscription(userId: string): Promise<ISubscriptionDTO>;
    createTrialSubscription(userId: string): Promise<ISubscriptionDTO>;
    isPremiumUser(userId: string): Promise<boolean>;
    processExpiredSubscriptions(): Promise<void>;
  }