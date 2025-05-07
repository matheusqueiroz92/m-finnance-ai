import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { 
  Category,
  CategoryCreateData, 
  CategoryUpdateData
} from '@/types/category';
import { ApiResponse } from '@/types/api-response';

export const createCategory = async (data: CategoryCreateData): Promise<Category> => {
  const response = await api.post<ApiResponse<Category>>(API_ROUTES.CATEGORIES.BASE, data);
  return response.data.data;
};

export const getCategories = async (type?: 'income' | 'expense' | 'investment'): Promise<Category[]> => {
  const params = type ? `?type=${type}` : '';
  const response = await api.get<ApiResponse<Category[]>>(`${API_ROUTES.CATEGORIES.BASE}${params}`);
  return response.data.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<ApiResponse<Category>>(API_ROUTES.CATEGORIES.DETAIL(id));
  return response.data.data;
};

export const updateCategory = async (id: string, data: CategoryUpdateData): Promise<Category> => {
  const response = await api.put<ApiResponse<Category>>(API_ROUTES.CATEGORIES.DETAIL(id), data);
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.CATEGORIES.DETAIL(id));
};