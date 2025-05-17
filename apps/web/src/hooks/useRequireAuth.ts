import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Só verificamos o redirecionamento quando o carregamento estiver concluído
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else {
        // Define isReady somente quando tiver certeza de que o usuário está autenticado
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, isReady, user };
}