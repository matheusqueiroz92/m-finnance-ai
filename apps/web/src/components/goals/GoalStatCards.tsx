import React from "react";
import { Card } from "@/components/ui/card";
import { Target, Check } from "lucide-react";
import { GoalStats } from "@/types/goal";
import { GoalStatCard } from "./GoalStatCard";

interface GoalStatCardsProps {
  stats?: GoalStats;
  isLoading: boolean;
}

export function GoalStatCards({ stats, isLoading }: GoalStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24"
          ></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <GoalStatCard
        label="Objetivos Ativos"
        value={stats?.totalGoals ?? 0}
        icon={<Target className="h-5 w-5" />}
        colorVariant="emerald"
      />
      <GoalStatCard
        label="Objetivos Concluídos"
        value={stats?.completedGoals ?? 0}
        icon={<Check className="h-5 w-5" />}
        colorVariant="blue"
      />
      <GoalStatCard
        label="Total Economizado"
        value={
          <>
            R${" "}
            {stats?.totalCurrentAmount?.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            }) ?? "0,00"}
          </>
        }
        icon={<span className="font-bold">R$</span>}
        colorVariant="purple"
      />
      <GoalStatCard
        label="Progresso Geral"
        value={`${Math.round(stats?.overallProgress ?? 0)}%`}
        icon={<span className="font-bold">%</span>}
        colorVariant="indigo"
      />
    </div>
  );
}
