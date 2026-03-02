"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/SideBar";
import Header from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/spinner";
import { EmailVerificationAlert } from "@/components/auth/EmailVerificationAlert";
import * as authService from "@/services/authService";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showEmailAlert, setShowEmailAlert] = useState(true);

  // Ouvir eventos de toggle da sidebar do Header
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent) => {
      setIsSidebarOpen(event.detail.isOpen);
    };

    document.addEventListener(
      "toggle-sidebar",
      handleToggleSidebar as EventListener
    );

    return () => {
      document.removeEventListener(
        "toggle-sidebar",
        handleToggleSidebar as EventListener
      );
    };
  }, []);

  // Sem autenticação: logout na API (limpa cookie) e redireciona para /login
  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    authService.logout();
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Carregando aplicação..." />;
  }

  if (!isAuthenticated) {
    return <LoadingSpinner fullScreen message="Redirecionando para login..." />;
  }

  return (
    <div
      className={`flex h-screen transition-colors duration-200 
                    ${theme === "dark" ? "bg-[#25343b] text-white" : "bg-white text-gray-900"}`}
    >
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0 -ml-64"} md:ml-0 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-0">
          {/* Alerta de verificação de e-mail */}
          {user && user.isEmailVerified === false && showEmailAlert && (
            <div className="mx-6 mt-6 mb-0">
              <EmailVerificationAlert
                userEmail={user.email}
                onDismiss={() => setShowEmailAlert(false)}
              />
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
