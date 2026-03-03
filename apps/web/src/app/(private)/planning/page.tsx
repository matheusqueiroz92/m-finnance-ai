"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PageTitle } from "@/components/shared/PageTitle";
import { FinancialPlanCard } from "@/components/planning/FinancialPlanCard";
import { PlanSimulator } from "@/components/planning/PlanSimulator";
import { AdherenceTracker } from "@/components/planning/AdherenceTracker";
import {
  usePlan,
  useSimulateScenario,
  useAdherence,
} from "@/hooks/usePlanningData";

export default function PlanningPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const [simSavingsPercent, setSimSavingsPercent] = useState(20);
  const [simMonths, setSimMonths] = useState(12);

  const { data: plan, isLoading: planLoading } = usePlan(isAuthenticated);
  const { data: simulation, isLoading: simLoading } = useSimulateScenario(
    simSavingsPercent,
    simMonths,
    isAuthenticated
  );
  const { data: adherence, isLoading: adherenceLoading } =
    useAdherence(isAuthenticated);

  const handleSimParamsChange = useCallback(
    (savingsPercent: number, months: number) => {
      setSimSavingsPercent(savingsPercent);
      setSimMonths(months);
    },
    []
  );

  const isLoading =
    authLoading || planLoading || adherenceLoading;

  if (authLoading) {
    return <LoadingScreen message="Carregando planejamento..." />;
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-[#25343b] min-h-screen transition-colors duration-200">
      <PageTitle
        title="Planejamento Financeiro"
        description="Plano 50/30/20, simulador de cenários e aderência"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialPlanCard plan={plan} isLoading={planLoading} />
        <AdherenceTracker adherence={adherence} isLoading={adherenceLoading} />
      </div>

      <PlanSimulator
        result={simulation}
        onParamsChange={handleSimParamsChange}
        isLoading={simLoading}
      />
    </div>
  );
}
