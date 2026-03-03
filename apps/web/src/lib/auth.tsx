"use client";

import React, { createContext, useContext, useState, useEffect, startTransition } from "react";
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

  // Ao montar: valida sessão via getProfile() (cookie HttpOnly enviado automaticamente)
  useEffect(() => {
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
        // Sem cookie ou token inválido: layout fará logout e redirect se em rota privada
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
        // Login social: cookie já foi setado pelo backend no redirect; só buscar usuário
        const userData = await authService.getProfile();
        setUser(userData);
      } else {
        const response = await authService.login(credentials);
        setUser(response.user);
      }
      clearForceLoginCookie();
      setIsLoading(false);
      startTransition(() => router.replace("/dashboard"));
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
      setIsLoading(false);
      startTransition(() => router.replace("/dashboard"));
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
