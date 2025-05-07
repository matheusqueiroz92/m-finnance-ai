import { injectable } from 'tsyringe';
import Stripe from 'stripe';
import { 
  IPaymentService,
  IPaymentMethodDTO,
  IPaymentIntentDTO,
  IPaymentSessionDTO,
  IPaymentCustomerDTO,
  ICreatePaymentIntentOptions,
  ICreatePaymentSessionOptions,
} from '../interfaces/services/IPaymentService';

@injectable()
export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is missing');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil', // Use a versão mais recente
    });
    
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createCustomer(email: string, name?: string): Promise<IPaymentCustomerDTO> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return {
      id: customer.id,
      email: customer.email || email,
      name: customer.name || name,
    };
  }

  async retrieveCustomer(customerId: string): Promise<IPaymentCustomerDTO> {
    const customer = await this.stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    return {
      id: customer.id,
      email: customer.email || '',
      name: customer.name || undefined,
    };
  }

  async createPaymentIntent(options: ICreatePaymentIntentOptions): Promise<IPaymentIntentDTO> {
    const { amount, currency, customerId, metadata } = options;

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      metadata,
    };

    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<IPaymentIntentDTO> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  async createCheckoutSession(options: ICreatePaymentSessionOptions): Promise<IPaymentSessionDTO> {
    const { customerId, priceId, successUrl, cancelUrl, metadata } = options;

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return {
      id: session.id,
      url: session.url || '',
    };
  }

  async listCustomerPaymentMethods(customerId: string): Promise<IPaymentMethodDTO[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.map((method) => ({
      id: method.id,
      type: method.type,
      brand: method.card?.brand || undefined,
      last4: method.card?.last4 || undefined,
      expiryMonth: method.card?.exp_month || undefined,
      expiryYear: method.card?.exp_year || undefined,
    }));
  }

  async validateWebhookEvent(payload: any, signature: string): Promise<{ type: string; data: any }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        type: event.type,
        data: event.data.object,
      };
    } catch (err) {
      throw new Error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}