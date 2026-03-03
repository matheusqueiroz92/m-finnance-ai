import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL, API_ROUTES } from "@/lib/constants/api-routes";
import { clearAuthToken } from "@/services/authService";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token só em cookie HttpOnly; não ler nem enviar token no header (segurança XSS)

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/auth/success", "/auth/social-callback"];

function isOnPublicPath(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

// 401 em rota não pública: limpa token e redireciona para login
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && error.config && typeof window !== "undefined" && !isOnPublicPath()) {
      clearAuthToken();
      try {
        await api.post(API_ROUTES.AUTH.LOGOUT);
      } catch {
        // ignora
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
