import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { ContactFormData } from '@/types/contact';

export const sendContactMessage = async (data: ContactFormData): Promise<void> => {
  await api.post<ApiResponse<{ success: boolean }>>(API_ROUTES.CONTACT.SEND, data);
};