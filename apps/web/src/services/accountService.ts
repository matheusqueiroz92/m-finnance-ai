import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { 
  Account,
  AccountCreateData, 
  AccountUpdateData, 
  AccountSummary
} from '@/types/account';

export const createAccount = async (data: AccountCreateData): Promise<Account> => {
  const response = await api.post<ApiResponse<Account>>(API_ROUTES.ACCOUNTS.BASE, data);
  return response.data.data;
};

export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get<ApiResponse<Account[]>>(API_ROUTES.ACCOUNTS.BASE);
  return response.data.data;
};

export const getAccountById = async (id: string): Promise<Account> => {
  const response = await api.get<ApiResponse<Account>>(API_ROUTES.ACCOUNTS.DETAIL(id));
  return response.data.data;
};

export const updateAccount = async (id: string, data: AccountUpdateData): Promise<Account> => {
  const response = await api.put<ApiResponse<Account>>(API_ROUTES.ACCOUNTS.DETAIL(id), data);
  return response.data.data;
};

export const deleteAccount = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.ACCOUNTS.DETAIL(id));
};

export const getAccountSummary = async (): Promise<AccountSummary> => {
  const response = await api.get<ApiResponse<AccountSummary>>(API_ROUTES.ACCOUNTS.SUMMARY);
  return response.data.data;
};