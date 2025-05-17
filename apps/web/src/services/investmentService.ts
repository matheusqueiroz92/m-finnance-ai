import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { 
  Investment,
  InvestmentCreateData, 
  InvestmentUpdateData,
  InvestmentSummary,
  InvestmentPerformance
} from '@/types/investment';

export const createInvestment = async (data: InvestmentCreateData): Promise<Investment> => {
  const response = await api.post<ApiResponse<Investment>>(API_ROUTES.INVESTMENTS.BASE, data);
  return response.data.data;
};

export const getInvestments = async (): Promise<Investment[]> => {
  const response = await api.get<ApiResponse<Investment[]>>(API_ROUTES.INVESTMENTS.BASE);
  return response.data.data;
};

export const getInvestmentById = async (id: string): Promise<Investment> => {
  const response = await api.get<ApiResponse<Investment>>(API_ROUTES.INVESTMENTS.DETAIL(id));
  return response.data.data;
};

export const updateInvestment = async (id: string, data: InvestmentUpdateData): Promise<Investment> => {
  const response = await api.put<ApiResponse<Investment>>(API_ROUTES.INVESTMENTS.DETAIL(id), data);
  return response.data.data;
};

export const deleteInvestment = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.INVESTMENTS.DETAIL(id));
};

export const getInvestmentSummary = async (): Promise<InvestmentSummary> => {
  const response = await api.get<ApiResponse<InvestmentSummary>>(API_ROUTES.INVESTMENTS.SUMMARY);
  return response.data.data;
};

export const getInvestmentPerformance = async (period: 'month' | 'quarter' | 'year'): Promise<InvestmentPerformance> => {
  const response = await api.get<ApiResponse<InvestmentPerformance>>(
    `${API_ROUTES.INVESTMENTS.PERFORMANCE}?period=${period}`
  );
  return response.data.data;
};