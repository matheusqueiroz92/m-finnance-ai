import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { FinancialInsights } from '@/types/report';
import { ApiResponse } from '@/types/api-response';

export const generateReport = async (
  period: 'month' | 'quarter' | 'year' = 'month',
  format: 'pdf' | 'excel' = 'pdf'
): Promise<Blob> => {
  const response = await api.get<Blob>(
    `${API_ROUTES.REPORTS.GENERATE}?period=${period}&format=${format}`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

export const getInsights = async (): Promise<FinancialInsights> => {
  const response = await api.get<ApiResponse<FinancialInsights>>(API_ROUTES.REPORTS.INSIGHTS);
  return response.data.data;
};