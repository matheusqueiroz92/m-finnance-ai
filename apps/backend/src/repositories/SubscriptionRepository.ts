import { injectable } from 'tsyringe';
import { ClientSession } from 'mongoose';
import { SubscriptionModel } from '../schemas/SubscriptionSchema';
import { ISubscriptionRepository } from '../interfaces/repositories/ISubscriptionRepository';
import { ISubscription, SubscriptionStatus, SubscriptionPlanType } from '../interfaces/entities/ISubscription';

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  async create(data: Partial<ISubscription>, options?: { session?: ClientSession }): Promise<ISubscription> {
    const subscription = new SubscriptionModel(data);
    return await subscription.save(options);
  }

  async findByUserId(userId: string): Promise<ISubscription | null> {
    return await SubscriptionModel.findOne({ user: userId });
  }

  async update(userId: string, data: Partial<ISubscription>, options?: { session?: ClientSession }): Promise<ISubscription | null> {
    return await SubscriptionModel.findOneAndUpdate(
      { user: userId },
      data,
      { 
        new: true, 
        runValidators: true,
        ...options
      }
    );
  }

  async updateStatus(userId: string, status: SubscriptionStatus, options?: { session?: ClientSession }): Promise<ISubscription | null> {
    return await SubscriptionModel.findOneAndUpdate(
      { user: userId },
      { status },
      { 
        new: true, 
        runValidators: true,
        ...options
      }
    );
  }

  async checkActivePremium(userId: string): Promise<boolean> {
    const subscription = await SubscriptionModel.findOne({
      user: userId,
      planType: SubscriptionPlanType.PREMIUM,
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
      endDate: { $gt: new Date() }
    });
    
    return !!subscription;
  }

  async processExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    
    // Update expired subscriptions
    await SubscriptionModel.updateMany(
      {
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        endDate: { $lte: now }
      },
      {
        status: SubscriptionStatus.EXPIRED,
        planType: SubscriptionPlanType.FREE
      }
    );
    
    // Update expired trials
    await SubscriptionModel.updateMany(
      {
        status: SubscriptionStatus.TRIAL,
        trialEndsAt: { $lte: now }
      },
      {
        status: SubscriptionStatus.EXPIRED,
        planType: SubscriptionPlanType.FREE
      }
    );
  }
}