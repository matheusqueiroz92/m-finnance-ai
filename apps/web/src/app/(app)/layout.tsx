'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/SideBar';
import Header from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Carregando aplicação..." />;
  }
  
  if (!isAuthenticated) {
    return null;
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