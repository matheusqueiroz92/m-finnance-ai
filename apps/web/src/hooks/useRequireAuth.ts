import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else {
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, isReady };
}