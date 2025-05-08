'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './SideBar';
import Header from './Header';
import { useAuth } from '@/lib/auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].some(
    route => pathname?.startsWith(route)
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">Carregando...</div>
      </div>
    );
  }
  
  if (!isAuthenticated && !isAuthPage) {
    return null; // O middleware vai redirecionar
  }
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}