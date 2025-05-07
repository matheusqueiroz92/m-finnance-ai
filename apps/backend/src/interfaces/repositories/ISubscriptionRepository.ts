import { ClientSession } from 'mongoose';
import { 
  ISubscription, 
  SubscriptionPlanType, 
  SubscriptionStatus 
} from '../entities/ISubscription';

export interface ISubscriptionRepository {
  create(data: Partial<ISubscription>, options?: { session?: ClientSession }): Promise<ISubscription>;
  findByUserId(userId: string): Promise<ISubscription | null>;
  update(userId: string, data: Partial<ISubscription>, options?: { session?: ClientSession }): Promise<ISubscription | null>;
  updateStatus(userId: string, status: SubscriptionStatus, options?: { session?: ClientSession }): Promise<ISubscription | null>;
  checkActivePremium(userId: string): Promise<boolean>;
  processExpiredSubscriptions(): Promise<void>;
}