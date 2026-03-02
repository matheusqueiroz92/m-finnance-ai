import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, API_ROUTES } from "@/lib/constants/api-routes";
import { clearAuthToken } from "@/services/authService";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Envia o token no header: usa o já definido na instância (p. ex. após login) ou lê do cookie
api.interceptors.request.use(
  (config) => {
    const fromHeader = config.headers.Authorization;
    const token =
      (typeof fromHeader === "string" && fromHeader.replace(/^Bearer\s+/i, "").trim()) ||
      Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

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
