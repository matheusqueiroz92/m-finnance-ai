"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { PiggyBank, Target, Calendar } from "lucide-react";
import type { FinancialPlan } from "@/types/planning";

interface FinancialPlanCardProps {
  plan: FinancialPlan | null | undefined;
  isLoading: boolean;
}

export function FinancialPlanCard({ plan, isLoading }: FinancialPlanCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <Card
        className={
          isDark
            ? "bg-white/10 backdrop-blur-sm border-white/20"
            : "bg-white border-gray-200"
        }
      >
        <CardHeader>
          <CardTitle>Plano Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) return null;

  return (
    <Card
      className={
        isDark
          ? "bg-white/10 backdrop-blur-sm border-white/20"
          : "bg-white border-gray-200"
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-emerald-500" />
          Plano 50/30/20
        </CardTitle>
        <p className="text-sm text-muted-foreground">{plan.message}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Alocação sugerida
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`p-3 rounded-lg text-center ${
                isDark ? "bg-emerald-500/20" : "bg-emerald-50"
              }`}
            >
              <p className="text-2xl font-bold text-emerald-600">
                {plan.allocation.needs}%
              </p>
              <p className="text-xs text-muted-foreground">Necessidades</p>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${
                isDark ? "bg-blue-500/20" : "bg-blue-50"
              }`}
            >
              <p className="text-2xl font-bold text-blue-600">
                {plan.allocation.wants}%
              </p>
              <p className="text-xs text-muted-foreground">Desejos</p>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${
                isDark ? "bg-purple-500/20" : "bg-purple-50"
              }`}
            >
              <p className="text-2xl font-bold text-purple-600">
                {plan.allocation.savings}%
              </p>
              <p className="text-xs text-muted-foreground">Poupança</p>
            </div>
          </div>
        </div>

        {plan.monthlyIncome > 0 && (
          <div className="flex justify-between items-center py-2 border-t">
            <span className="text-sm text-muted-foreground">
              Renda média (últimos 3 meses)
            </span>
            <span className="font-semibold">
              R${" "}
              {plan.monthlyIncome.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {plan.suggestedMonthlySavings > 0 && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              isDark ? "bg-emerald-500/10" : "bg-emerald-50"
            }`}
          >
            <Calendar className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Poupança sugerida ao mês</p>
              <p className="text-lg font-bold text-emerald-600">
                R${" "}
                {plan.suggestedMonthlySavings.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        )}

        {plan.suggestedGoals?.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Metas sugeridas</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.suggestedGoals.map((g, i) => (
                <li key={i}>
                  • {g.name}: R${" "}
                  {g.targetAmount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  em {g.suggestedMonths} meses
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
