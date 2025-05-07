import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';

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

export const createCheckoutSession = async (data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> => {
  const response = await api.post<ApiResponse<CheckoutSessionResponse>>(
    API_ROUTES.PAYMENTS.CHECKOUT, 
    data
  );
  return response.data.data;
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<ApiResponse<PaymentMethod[]>>(API_ROUTES.PAYMENTS.METHODS);
  return response.data.data;
};