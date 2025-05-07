import { Document, Types } from "mongoose";

export enum SubscriptionPlanType {
    FREE = 'free',
    PREMIUM = 'premium',
  }
  
  export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    TRIAL = 'trial',
  }
  
  export interface ISubscription extends Document {
    user: Types.ObjectId;
    planType: SubscriptionPlanType;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    trialEndsAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ISubscriptionDTO {
    _id: string;
    planType: SubscriptionPlanType;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    trialEndsAt?: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
  }