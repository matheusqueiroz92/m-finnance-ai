"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { LoginCredentials, RegisterData, User } from '@/types/user';
import * as authService from '@/services/authService';

// Interface para o contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
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
  return useContext(AuthContext);
}

// Provedor de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        Cookies.remove('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      Cookies.set('token', response.token, { expires: 7 });
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      Cookies.set('token', response.token, { expires: 7 });
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const updateUserData = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isPremium,
    login,
    register,
    logout,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}