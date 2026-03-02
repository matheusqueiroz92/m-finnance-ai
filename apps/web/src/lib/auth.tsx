"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { LoginCredentials, RegisterData, User } from "@/types/user";
import * as authService from "@/services/authService";
import { clearForceLoginCookie } from "@/services/authService";
import { handleError } from "@/lib/errors";

// Interface para o contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (credentials: LoginCredentials | string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUserData: (data: Partial<User>) => void;
}

// Contexto padrão
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isPremium: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserData: () => {},
};

// Contexto de autenticação
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

// Provedor de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;
  const isPremium = user?.isPremium || false;

  // Verifica sessão apenas se existir token (evita 401 na página de login)
  useEffect(() => {
    const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
    if (!token) {
      setIsLoading(false);
      return;
    }
    const checkAuth = async () => {
      try {
        const timeoutMs = 15000;
        const userData = await Promise.race([
          authService.getProfile(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), timeoutMs)
          ),
        ]);
        setUser(userData);
      } catch {
        // Token inválido: interceptor ou layout farão logout e redirect
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials | string) => {
    setIsLoading(true);
    try {
      if (typeof credentials === "string") {
        authService.setAuthToken(credentials);
        const userData = await authService.getProfile();
        setUser(userData);
      } else {
        const response = await authService.login(credentials);
        if (response.token) authService.setAuthToken(response.token);
        setUser(response.user);
      }
      clearForceLoginCookie();
      setIsLoading(false);
      router.replace("/dashboard");
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (response.token) authService.setAuthToken(response.token);
      setUser(response.user);
      setIsLoading(false);
      router.replace("/dashboard");
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout(); // chama API para limpar cookie e redireciona para /login
  };

  const updateUserData = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isPremium,
    login,
    register,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
