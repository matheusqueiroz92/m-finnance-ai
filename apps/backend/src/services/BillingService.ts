import { injectable, inject } from 'tsyringe';
import { IBillingService, ICreateCheckoutDTO } from '../interfaces/services/IBillingService';
import { IPaymentService } from '../interfaces/services/IPaymentService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { ISubscriptionRepository } from '../interfaces/repositories/ISubscriptionRepository';
import { ISubscriptionDTO, SubscriptionStatus } from '../interfaces/entities/ISubscription';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';
import mongoose from 'mongoose';

@injectable()
export class BillingService implements IBillingService {
  constructor(
    @inject('PaymentService')
    private paymentService: IPaymentService,
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('SubscriptionRepository')
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  /**
   * Create a Stripe customer for a user
   */
  async createCustomerForUser(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new ApiError('Usuário não encontrado', 404);
    }
    
    // Check if user already has a subscription with a Stripe customer ID
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    
    if (subscription && subscription.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }
    
    // Create new customer in Stripe
    const customer = await this.paymentService.createCustomer(user.email, user.name);
    
    // Update subscription with customer ID
    if (subscription) {
      await this.subscriptionRepository.update(userId, {
        stripeCustomerId: customer.id
      });
    }
    
    return customer.id;
  }
  
  /**
   * Create a checkout session for a subscription
   */
  async createCheckoutSession(userId: string, options: ICreateCheckoutDTO): Promise<string> {
    return TransactionManager.executeInTransaction(async (session) => {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new ApiError('Usuário não encontrado', 404);
      }
      
      let customerId: string;
      
      // Get subscription to check for customer ID
      const subscription = await this.subscriptionRepository.findByUserId(userId);
      
      if (subscription && subscription.stripeCustomerId) {
        customerId = subscription.stripeCustomerId;
      } else {
        // Create new customer
        const customer = await this.paymentService.createCustomer(user.email, user.name);
        customerId = customer.id;
        
        // Update subscription with customer ID if it exists
        if (subscription) {
          await this.subscriptionRepository.update(userId, {
            stripeCustomerId: customerId
          }, { session });
        }
      }
      
      // Include user ID in metadata
      const metadata = {
        ...options.metadata,
        userId,
      };
      
      // Create checkout session
      const checkoutSession = await this.paymentService.createCheckoutSession({
        customerId,
        priceId: options.priceId,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        metadata,
      });
      
      return checkoutSession.url;
    });
  }
  
  /**
   * Handle subscription updated webhook event
   */
  async handleSubscriptionUpdated(stripeSubscriptionId: string, status: string): Promise<ISubscriptionDTO | null> {
    // Find the subscription with this Stripe subscription ID
    const allSubscriptions = await mongoose.model('Subscription').find({
      stripeSubscriptionId
    });
    
    if (!allSubscriptions || allSubscriptions.length === 0) {
      return null;
    }
    
    const subscription = allSubscriptions[0];
    
    // Map Stripe status to our status
    let subscriptionStatus: SubscriptionStatus;
    
    switch (status) {
      case 'active':
        subscriptionStatus = SubscriptionStatus.ACTIVE;
        break;
      case 'canceled':
        subscriptionStatus = SubscriptionStatus.CANCELED;
        break;
      case 'past_due':
      case 'unpaid':
      case 'incomplete':
      case 'incomplete_expired':
        subscriptionStatus = SubscriptionStatus.EXPIRED;
        break;
      default:
        subscriptionStatus = SubscriptionStatus.ACTIVE;
    }
    
    // Update subscription
    const updatedSubscription = await this.subscriptionRepository.update(
      subscription.user.toString(),
      { status: subscriptionStatus }
    );
    
    if (!updatedSubscription) {
      return null;
    }
    
    return {
      _id: (updatedSubscription._id as mongoose.Types.ObjectId).toString(),
      planType: updatedSubscription.planType,
      status: updatedSubscription.status,
      startDate: updatedSubscription.startDate,
      endDate: updatedSubscription.endDate,
      trialEndsAt: updatedSubscription.trialEndsAt,
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      createdAt: updatedSubscription.createdAt,
      updatedAt: updatedSubscription.updatedAt
    };
  }
  
  /**
   * Handle subscription deleted webhook event
   */
  async handleSubscriptionDeleted(stripeSubscriptionId: string): Promise<ISubscriptionDTO | null> {
    // Find the subscription with this Stripe subscription ID
    const allSubscriptions = await mongoose.model('Subscription').find({
      stripeSubscriptionId
    });
    
    if (!allSubscriptions || allSubscriptions.length === 0) {
      return null;
    }
    
    const subscription = allSubscriptions[0];
    
    // Update subscription to canceled status
    const updatedSubscription = await this.subscriptionRepository.update(
      subscription.user.toString(),
      { status: SubscriptionStatus.CANCELED }
    );
    
    if (!updatedSubscription) {
      return null;
    }
    
    return {
      _id: (updatedSubscription._id as mongoose.Types.ObjectId).toString(),
      planType: updatedSubscription.planType,
      status: updatedSubscription.status,
      startDate: updatedSubscription.startDate,
      endDate: updatedSubscription.endDate,
      trialEndsAt: updatedSubscription.trialEndsAt,
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      createdAt: updatedSubscription.createdAt,
      updatedAt: updatedSubscription.updatedAt
    };
  }
  
  /**
   * Handle payment succeeded webhook event
   */
  async handlePaymentSucceeded(paymentIntentId: string): Promise<boolean> {
    // In a real implementation, update payment records
    // This is a simplified version
    console.log(`Payment succeeded: ${paymentIntentId}`);
    return true;
  }
  
  /**
   * Handle payment failed webhook event
   */
  async handlePaymentFailed(paymentIntentId: string): Promise<boolean> {
    // In a real implementation, update payment records and notify users
    // This is a simplified version
    console.log(`Payment failed: ${paymentIntentId}`);
    return true;
  }
  
  /**
   * Get a customer's payment methods
   */
  async getCustomerPaymentMethods(userId: string): Promise<any[]> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    
    if (!subscription || !subscription.stripeCustomerId) {
      return [];
    }
    
    try {
      return await this.paymentService.listCustomerPaymentMethods(subscription.stripeCustomerId);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }
}