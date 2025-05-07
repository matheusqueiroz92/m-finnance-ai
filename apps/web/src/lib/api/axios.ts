import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/lib/constants/api-routes';
import { refreshToken } from '@/services/authService';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    // Se o token expirou (status 401) e não é uma requisição de refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers._retry) {
      originalRequest.headers._retry = true;
      
      try {
        // Tenta obter um novo token
        const token = await refreshToken();
        // Atualiza o token para a requisição atual
        originalRequest.headers.Authorization = `Bearer ${token}`;
        // Refaz a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar, redireciona para login
        Cookies.remove('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;