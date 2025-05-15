
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from './SideBar';
import Header from './Header';
import { LoadingScreen } from '@/components/ui/loading-screen';

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
    
    // Se estamos em uma página 404, o next.js redirecionará automaticamente
    const is404 = !pathname || pathname === '';
    
    if (!authLoading && !isAuthenticated && !isAuthPage && !is404) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, pathname, router]);
  
  // Determinar se é uma página de autenticação
  const isAuthPage = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].some(
    route => pathname?.startsWith(route)
  );
  
  // Se é uma página não encontrada (quando pathname é null ou undefined)
  if (!pathname) {
    return <>{children}</>;
  }
  
  // Se ainda não montou e está carregando, mostra loading screen
  if (!mounted || authLoading) {
    return <LoadingScreen message="Carregando aplicação..." />;
  }
  
  // Se é uma página de auth, renderiza apenas o children
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // Se não está autenticado e não é página de auth, retorna null (será redirecionado)
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