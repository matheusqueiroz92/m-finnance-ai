"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/services/authService";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailTokenPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setError("Token de verificação não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setIsSuccess(true);

        // Limpar cookies e forçar novo login para atualizar o contexto de autenticação
        setTimeout(() => {
          // Limpar cookies de autenticação
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(
                /=.*/,
                "=;expires=" + new Date().toUTCString() + ";path=/"
              );
          });
          // Redirecionar para login com mensagem de sucesso
          window.location.href = "/login?verified=true";
        }, 2000);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Erro ao verificar e-mail. Tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailToken();
  }, [token, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner fullScreen />
          <p className="mt-4 text-gray-600">Verificando seu e-mail...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            E-mail Verificado!
          </h1>
          <p className="text-gray-600 mb-4">
            Seu e-mail foi verificado com sucesso! Você será redirecionado para
            fazer login novamente.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Erro na Verificação
        </h1>
        <Alert className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/verify-email")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Ir para Login
          </button>
        </div>
      </div>
    </div>
  );
}
