"use client";

import React from "react";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PageTitle } from "@/components/shared/PageTitle";
import { ConsultantChat } from "@/components/consultant/ConsultantChat";

export default function ConsultantPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen message="Carregando consultor..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle
        title="Consultor Financeiro"
        description="Pergunte sobre seu score, metas, gastos e investimentos. As respostas usam seus dados do M. Finnance."
      />
      <ConsultantChat />
    </div>
  );
}
