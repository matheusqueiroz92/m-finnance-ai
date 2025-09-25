"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      if (isAuthenticated) {
        console.log("AuthSuccessPage - Já autenticado, redirecionando para dashboard");
        router.replace("/dashboard");
        setPageLoading(false);
        return;
      }

      if (isLoading) {
        console.log("AuthSuccessPage - Ainda carregando autenticação...");
        return;
      }

      try {
        // Acessar a rota /api/auth/me para verificar a autenticação
        // e obter os dados do usuário, que agora devem estar nos cookies HttpOnly
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Importante para enviar cookies HttpOnly
        });

        if (response.ok) {
          const { user } = await response.json();
          console.log("AuthSuccessPage - Usuário autenticado via cookies:", user);
          // O login no contexto de auth já deve ter sido feito pelo middleware ou pelo checkAuth inicial
          // Se o user estiver presente, significa que o token foi validado e o estado do usuário foi carregado.
          // Apenas garantimos que o estado local do useAuth está atualizado.
          await login(user); // Atualiza o estado do user no AuthContext
          toast.success("Login social realizado com sucesso!");
          router.replace("/dashboard");
        } else {
          const errorData = await response.json();
          console.error("AuthSuccessPage - Falha na verificação de autenticação:", errorData);
          toast.error(`Falha na autenticação: ${errorData.error || 'Erro desconhecido'}`);
          router.replace("/login");
        }
      } catch (err) {
        console.error("AuthSuccessPage - Erro ao verificar autenticação:", err);
        toast.error("Erro ao processar login social.");
        router.replace("/login");
      } finally {
        setPageLoading(false);
      }
    };

    handleAuthSuccess();
  }, [isAuthenticated, isLoading, login, router]);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#25343b] text-white">
        <p>Processando login social seguro...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#25343b] text-white">
        <p>Erro: {pageError}</p>
      </div>
    );
  }

  return null;
}
