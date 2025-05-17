'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/SideBar';
import Header from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Ouvir eventos de toggle da sidebar do Header
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent) => {
      setIsSidebarOpen(event.detail.isOpen);
    };
    
    document.addEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleSidebar as EventListener);
    };
  }, []);
  
  useEffect(() => {
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
    <div className={`flex h-screen transition-colors duration-200 
                    ${theme === 'dark' ? 'bg-[#25343b] text-white' : 'bg-white text-gray-900'}`}>
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0 -ml-64'} md:ml-0 transition-all duration-300 ease-in-out overflow-hidden`}>
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-0">{children}</div>
      </main>
    </div>
  );
}