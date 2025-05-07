import { Schema, model } from 'mongoose';
import { ISubscription, SubscriptionPlanType, SubscriptionStatus } from '../interfaces/entities/ISubscription';

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    planType: {
      type: String,
      enum: Object.values(SubscriptionPlanType),
      default: SubscriptionPlanType.FREE,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.TRIAL,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    trialEndsAt: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel = model<ISubscription>('Subscription', subscriptionSchema);