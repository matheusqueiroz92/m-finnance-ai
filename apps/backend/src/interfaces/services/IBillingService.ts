import { ISubscriptionDTO } from '../entities/ISubscription';

export interface ICreateCheckoutDTO {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface IBillingService {
  createCustomerForUser(userId: string): Promise<string>;
  createCheckoutSession(userId: string, options: ICreateCheckoutDTO): Promise<string>;
  handleSubscriptionUpdated(stripeSubscriptionId: string, status: string): Promise<ISubscriptionDTO | null>;
  handleSubscriptionDeleted(stripeSubscriptionId: string): Promise<ISubscriptionDTO | null>;
  handlePaymentSucceeded(paymentIntentId: string): Promise<boolean>;
  handlePaymentFailed(paymentIntentId: string): Promise<boolean>;
  getCustomerPaymentMethods(userId: string): Promise<any[]>;
}