"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LoginCredentials, RegisterData, User } from "@/types/user";
import * as authService from "@/services/authService";
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

  // Valores computados
  const isAuthenticated = !!user;
  const isPremium = user?.isPremium || false;

  // Efeito para verificar autenticação inicial
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        handleError(error);
        Cookies.remove("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials | string) => {
    setIsLoading(true);
    try {
      let response;

      if (typeof credentials === "string") {
        // Login com token (social login)
        Cookies.set("token", credentials, { expires: 7 });
        const userData = await authService.getProfile();
        response = { user: userData, token: credentials };
      } else {
        // Login com credenciais
        response = await authService.login(credentials);
        Cookies.set("token", response.token, { expires: 7 });
      }

      setUser(response.user);
      setIsLoading(false);

      // Redirecionar para dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.user);
      Cookies.set("token", response.token, { expires: 7 });
      setIsLoading(false);

      // Usar router.replace em vez de router.push
      router.replace("/dashboard");
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.replace("/login");
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
