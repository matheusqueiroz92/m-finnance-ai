import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { 
  Subscription,
  SubscriptionUpdateData,
  SubscriptionPlanType
} from '@/types/subscription';
import { ApiResponse } from '@/types/api-response';

export const getCurrentSubscription = async (): Promise<Subscription | null> => {
  try {
    const response = await api.get<ApiResponse<Subscription>>(API_ROUTES.SUBSCRIPTIONS.BASE);
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const startTrial = async (): Promise<Subscription> => {
  const response = await api.post<ApiResponse<Subscription>>(API_ROUTES.SUBSCRIPTIONS.TRIAL);
  return response.data.data;
};

export const cancelSubscription = async (): Promise<Subscription> => {
  const response = await api.post<ApiResponse<Subscription>>(API_ROUTES.SUBSCRIPTIONS.CANCEL);
  return response.data.data;
};

export const updateSubscriptionPlan = async (planType: SubscriptionPlanType): Promise<Subscription> => {
  const response = await api.put<ApiResponse<Subscription>>(
    API_ROUTES.SUBSCRIPTIONS.PLAN, 
    { planType }
  );
  return response.data.data;
};