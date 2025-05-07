export interface IPaymentMethodDTO {
    id: string;
    type: string;
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  }
  
  export interface IPaymentIntentDTO {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret?: string;
  }
  
  export interface IPaymentSessionDTO {
    id: string;
    url: string;
  }
  
  export interface IPaymentCustomerDTO {
    id: string;
    email: string;
    name?: string;
  }
  
  export interface ICreatePaymentIntentOptions {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }
  
  export interface ICreatePaymentSessionOptions {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }
  
  export interface IPaymentService {
    createCustomer(email: string, name?: string): Promise<IPaymentCustomerDTO>;
    retrieveCustomer(customerId: string): Promise<IPaymentCustomerDTO>;
    createPaymentIntent(options: ICreatePaymentIntentOptions): Promise<IPaymentIntentDTO>;
    retrievePaymentIntent(paymentIntentId: string): Promise<IPaymentIntentDTO>;
    createCheckoutSession(options: ICreatePaymentSessionOptions): Promise<IPaymentSessionDTO>;
    listCustomerPaymentMethods(customerId: string): Promise<IPaymentMethodDTO[]>;
    validateWebhookEvent(payload: any, signature: string): Promise<{ type: string; data: any }>;
  }