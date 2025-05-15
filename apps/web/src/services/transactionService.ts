import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse, ApiPaginatedResponse } from '@/types/api-response';
import { 
  Transaction,
  TransactionCreateData, 
  TransactionUpdateData, 
  TransactionFilters,
  TransactionListResponse,
  TransactionStats
} from '@/types/transaction';

export const createTransaction = async (data: TransactionCreateData, attachments?: File[]): Promise<Transaction> => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  
  const response = await api.post<ApiResponse<Transaction>>(API_ROUTES.TRANSACTIONS.BASE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const getTransactions = async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await api.get<ApiPaginatedResponse<Transaction>>(
    `${API_ROUTES.TRANSACTIONS.BASE}?${params.toString()}`
  );
  
  return {
    transactions: response.data.data,
    total: response.data.pagination.total,
    page: response.data.pagination.page,
    limit: response.data.pagination.limit,
    pages: response.data.pagination.pages,
  };
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const response = await api.get<ApiResponse<Transaction>>(API_ROUTES.TRANSACTIONS.DETAIL(id));
  return response.data.data;
};

export const updateTransaction = async (
  id: string, 
  data: TransactionUpdateData, 
  attachments?: File[],
  keepExistingAttachments: boolean = false
): Promise<Transaction> => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  
  formData.append('keepExistingAttachments', String(keepExistingAttachments));
  
  const response = await api.put<ApiResponse<Transaction>>(
    API_ROUTES.TRANSACTIONS.DETAIL(id), 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.TRANSACTIONS.DETAIL(id));
};

export const removeAttachment = async (transactionId: string, attachmentId: string): Promise<Transaction> => {
  const response = await api.delete<ApiResponse<Transaction>>(
    API_ROUTES.TRANSACTIONS.ATTACHMENT(transactionId, attachmentId)
  );
  return response.data.data;
};

export const getTransactionStats = async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<TransactionStats> => {
  const response = await api.get<ApiResponse<TransactionStats>>(
    `${API_ROUTES.TRANSACTIONS.STATS}?period=${period}`
  );
  return response.data.data;
};
