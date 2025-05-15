'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from './SideBar';
import Header from './Header';
import { LoadingSpinner } from '@/components/ui/spinner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Todos os hooks devem ser chamados sempre, não condicionalmente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hook para redirecionamento
  useEffect(() => {
    const isAuthPage = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].some(
      route => pathname?.startsWith(route)
    );
    
    const isSpecialPage = pathname === '/not-found' || pathname === '/404';
    
    if (!authLoading && !isAuthenticated && !isAuthPage && !isSpecialPage) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, pathname, router]);
  
  // Determinar se é uma página de autenticação ou especial
  const isAuthPage = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].some(
    route => pathname?.startsWith(route)
  );
  
  // Páginas especiais que não devem ter layout (404, not-found, etc)
  const isSpecialPage = pathname === '/not-found' || pathname === '/404';
  
  // Se ainda não montou e está carregando, mostra spinner
  if (!mounted || authLoading) {
    return <LoadingSpinner fullScreen message="Carregando aplicação..." />;
  }
  
  // Se é uma página de auth ou especial, renderiza apenas o children
  if (isAuthPage || isSpecialPage) {
    return <>{children}</>;
  }
  
  // Se não está autenticado e não é página de auth/especial, retorna null (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }
  
  // Se está autenticado, renderiza o layout completo
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