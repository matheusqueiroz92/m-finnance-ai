import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { 
  CreditCard,
  CreditCardCreateData, 
  CreditCardUpdateData,
  CreditCardBilling,
  CreditCardSummary
} from '@/types/credit-card';

export const createCreditCard = async (data: CreditCardCreateData): Promise<CreditCard> => {
  const response = await api.post<ApiResponse<CreditCard>>(API_ROUTES.CREDIT_CARDS.BASE, data);
  return response.data.data;
};

export const getCreditCards = async (): Promise<CreditCard[]> => {
  const response = await api.get<ApiResponse<CreditCard[]>>(API_ROUTES.CREDIT_CARDS.BASE);
  return response.data.data;
};

export const getCreditCardById = async (id: string): Promise<CreditCard> => {
  const response = await api.get<ApiResponse<CreditCard>>(API_ROUTES.CREDIT_CARDS.DETAIL(id));
  return response.data.data;
};

export const updateCreditCard = async (id: string, data: CreditCardUpdateData): Promise<CreditCard> => {
  const response = await api.put<ApiResponse<CreditCard>>(API_ROUTES.CREDIT_CARDS.DETAIL(id), data);
  return response.data.data;
};

export const deleteCreditCard = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.CREDIT_CARDS.DETAIL(id));
};

export const getCreditCardSummary = async (): Promise<CreditCardSummary> => {
  const response = await api.get<ApiResponse<CreditCardSummary>>(API_ROUTES.CREDIT_CARDS.SUMMARY);
  return response.data.data;
};

export const getCreditCardBillings = async (creditCardId?: string): Promise<CreditCardBilling[]> => {
  const url = creditCardId 
    ? `${API_ROUTES.CREDIT_CARDS.BILLINGS}?creditCard=${creditCardId}`
    : API_ROUTES.CREDIT_CARDS.BILLINGS;
    
  const response = await api.get<ApiResponse<CreditCardBilling[]>>(url);
  return response.data.data;
};

export const validateSecurityCode = async (id: string, securityCode: string): Promise<boolean> => {
  const response = await api.post<ApiResponse<{ isValid: boolean }>>(
    API_ROUTES.CREDIT_CARDS.VALIDATE_SECURITY_CODE(id),
    { securityCode }
  );
  return response.data.data.isValid;
};