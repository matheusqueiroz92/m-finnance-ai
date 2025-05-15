import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { 
  Goal,
  GoalCreateData, 
  GoalUpdateData,
  GoalStats
} from '@/types/goal';

export const createGoal = async (data: GoalCreateData): Promise<Goal> => {
  const response = await api.post<ApiResponse<Goal>>(API_ROUTES.GOALS.BASE, data);
  return response.data.data;
};

export const getGoals = async (isCompleted?: boolean): Promise<Goal[]> => {
  const params = isCompleted !== undefined ? `?isCompleted=${isCompleted}` : '';
  const response = await api.get<ApiResponse<Goal[]>>(`${API_ROUTES.GOALS.BASE}${params}`);
  return response.data.data;
};

export const getGoalById = async (id: string): Promise<Goal> => {
  const response = await api.get<ApiResponse<Goal>>(API_ROUTES.GOALS.DETAIL(id));
  return response.data.data;
};

export const updateGoal = async (id: string, data: GoalUpdateData): Promise<Goal> => {
  const response = await api.put<ApiResponse<Goal>>(API_ROUTES.GOALS.DETAIL(id), data);
  return response.data.data;
};

export const deleteGoal = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<{ success: boolean }>>(API_ROUTES.GOALS.DETAIL(id));
};

export const getGoalStats = async (): Promise<GoalStats> => {
  const response = await api.get<ApiResponse<GoalStats>>(API_ROUTES.GOALS.STATS);
  return response.data.data;
};