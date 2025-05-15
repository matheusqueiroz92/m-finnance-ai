import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { 
  CreditCard,
  CreditCardCreate,
  CreditCardUpdate,
  CreditCardBalance
} from '../types/credit-card';


export const createCreditCard = async (data: CreditCardCreate): Promise<CreditCard> => {
  const response = await api.post<ApiResponse<CreditCard>>(API_ROUTES.CREDIT_CARDS.BASE, data);
  return response.data.data;
};

export const getCreditCards = async (isActive?: boolean): Promise<CreditCard[]> => {
  const params = isActive !== undefined ? `?isActive=${isActive}` : '';
  const response = await api.get<ApiResponse<CreditCard[]>>(`${API_ROUTES.CREDIT_CARDS.BASE}${params}`);
  return response.data.data;
};

export const getCreditCardById = async (id: string): Promise<CreditCard> => {
  const response = await api.get<ApiResponse<CreditCard>>(API_ROUTES.CREDIT_CARDS.DETAIL(id));
  return response.data.data;
};

export const updateCreditCard = async (id: string, data: CreditCardUpdate): Promise<CreditCard> => {
  const response = await api.put<ApiResponse<CreditCard>>(API_ROUTES.CREDIT_CARDS.DETAIL(id), data);
  return response.data.data;
};

export const deleteCreditCard = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.CREDIT_CARDS.DETAIL(id));
};

export const getCreditCardBalance = async (id: string): Promise<CreditCardBalance> => {
  const response = await api.get<ApiResponse<CreditCardBalance>>(API_ROUTES.CREDIT_CARDS.BALANCE(id));
  return response.data.data;
};

export const validateSecurityCode = async (id: string, securityCode: string): Promise<boolean> => {
  const response = await api.post<ApiResponse<{ isValid: boolean }>>(
    `${API_ROUTES.CREDIT_CARDS.DETAIL(id)}/validate-security-code`, 
    { securityCode }
  );
  return response.data.data.isValid;
};