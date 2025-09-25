"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function SocialCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("SocialCallbackPage renderizada - /social-callback");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        console.log("Social callback - Token recebido:", token);

        if (!token) {
          console.error("Token não encontrado na URL");
          setError("Token não encontrado");
          setLoading(false);
          return;
        }

        console.log("Armazenando token no localStorage");
        localStorage.setItem("token", token);

        console.log("Fazendo login com token");
        await login(token);

        console.log("Redirecionando para dashboard");
        router.push("/dashboard");
      } catch (error) {
        console.error("Erro no callback social:", error);
        setError("Erro ao processar login social");
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processando login...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erro no Login
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
