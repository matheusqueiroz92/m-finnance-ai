'use client';

import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/spinner';

interface PageLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function PageLayout({ children, requireAuth = true }: PageLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Se requer autenticação e ainda está carregando, mostra loading
  if (requireAuth && isLoading) {
    return <LoadingSpinner message="Carregando..." />;
  }
  
  // Se requer autenticação e não está autenticado, não renderiza
  if (requireAuth && !isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}