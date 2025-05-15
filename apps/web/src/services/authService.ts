import api from '@/lib/api/axios';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { ApiResponse } from '@/types/api-response';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  ChangePasswordData, 
  UserUpdateData, 
  User 
} from '@/types/user';
import Cookies from 'js-cookie';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.LOGIN, credentials);
  return response.data.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });
  
  const response = await api.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.REGISTER, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(API_ROUTES.AUTH.PROFILE);
  return response.data.data;
};

export const updateProfile = async (data: UserUpdateData): Promise<User> => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'avatar' && value instanceof File) {
        formData.append('avatar', value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  const response = await api.put<ApiResponse<User>>(API_ROUTES.AUTH.PROFILE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.post<ApiResponse<null>>(API_ROUTES.AUTH.CHANGE_PASSWORD, data);
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post<ApiResponse<null>>(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await api.post<ApiResponse<null>>(API_ROUTES.AUTH.RESET_PASSWORD, { token, password });
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post<ApiResponse<null>>(API_ROUTES.AUTH.VERIFY_EMAIL, { token });
};

export const resendVerificationEmail = async (): Promise<void> => {
  await api.post<ApiResponse<null>>(API_ROUTES.AUTH.RESEND_VERIFICATION);
};

export const refreshToken = async (): Promise<string> => {
  // Implementar lógica de refresh token se necessário
  // Na implementação atual, o refreshToken é gerenciado pelo interceptor
  return '';
};

export const logout = (): void => {
  Cookies.remove('token');
};
