"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      toast.success("Login social realizado com sucesso!");
      router.replace("/dashboard");
      return;
    }
    toast.error("Sessão não encontrada. Tente fazer login novamente.");
    router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#25343b] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p>Processando login social...</p>
      </div>
    </div>
  );
}
