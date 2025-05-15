'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface RouteChangeProviderProps {
  children: React.ReactNode;
}

export function RouteChangeProvider({ children }: RouteChangeProviderProps) {
  const [isChangingRoute, setIsChangingRoute] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsChangingRoute(true);
    };

    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setIsChangingRoute(false);
      }, 300);
    };

    // Este efeito zera o estado quando o pathname muda
    setIsChangingRoute(false);

    // Adicionar eventos para o roteador do Next.js
    window.addEventListener('beforeunload', handleRouteChangeStart);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart);
    };
  }, [pathname]);

  return (
    <>
      {isChangingRoute && <LoadingScreen message="Carregando página..." />}
      {children}
    </>
  );
}