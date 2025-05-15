export interface PaymentMethod {
    id: string;
    type: string;
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  }
  
  export interface CheckoutSessionRequest {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }
  
  export interface CheckoutSessionResponse {
    url: string;
  }