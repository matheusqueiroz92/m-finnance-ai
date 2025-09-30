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
        console.log(
          "AuthSuccessPage - Já autenticado, redirecionando para dashboard"
        );
        router.replace("/dashboard");
        setPageLoading(false);
        return;
      }

      if (isLoading) {
        console.log("AuthSuccessPage - Ainda carregando autenticação...");
        return;
      }

      try {
        // 🔍 VERIFICAR SE HÁ TOKEN NA URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
          console.log("AuthSuccessPage - Token recebido via URL:", token);

          // 🔐 FAZER LOGIN COM TOKEN
          await login(token);

          // 🏠 REDIRECIONAR PARA DASHBOARD
          toast.success("Login social realizado com sucesso!");
          router.replace("/dashboard");
        } else {
          console.error("AuthSuccessPage - Token não encontrado na URL");
          toast.error("Token de autenticação não encontrado.");
          router.replace("/login");
        }
      } catch (err) {
        console.error("AuthSuccessPage - Erro ao processar login social:", err);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Processando login social seguro...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#25343b] text-white">
        <div className="text-center">
          <p className="text-red-400">Erro: {pageError}</p>
          <button
            onClick={() => router.replace("/login")}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
