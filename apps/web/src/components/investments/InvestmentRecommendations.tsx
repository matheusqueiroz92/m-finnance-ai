"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lightbulb, TrendingUp, Target, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import type { InvestmentRecommendation, InvestmentProfile } from "@/types/investment";

interface InvestmentRecommendationsProps {
  data?: InvestmentRecommendation | null;
  profile: InvestmentProfile;
  onProfileChange: (profile: InvestmentProfile) => void;
  isLoading: boolean;
}

const PROFILE_LABELS: Record<InvestmentProfile, string> = {
  conservador: "Conservador",
  moderado: "Moderado",
  arrojado: "Arrojado",
};

export function InvestmentRecommendations({
  data,
  profile,
  onProfileChange,
  isLoading,
}: InvestmentRecommendationsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <Card
        className={`border shadow transition-colors duration-200 ${
          isDark
            ? "bg-white/10 backdrop-blur-sm border-white/20"
            : "bg-white border-gray-200"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sugestões de Investimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border shadow transition-colors duration-200 ${
        isDark
          ? "bg-white/10 backdrop-blur-sm border-white/20"
          : "bg-white border-gray-200"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb
            className={`h-5 w-5 ${isDark ? "text-amber-400" : "text-amber-600"}`}
          />
          Sugestões de Investimento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Recomendações personalizadas com base no seu perfil de risco
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={profile}
          onValueChange={(v) => onProfileChange(v as InvestmentProfile)}
        >
          <TabsList className="grid w-full grid-cols-3">
            {(Object.keys(PROFILE_LABELS) as InvestmentProfile[]).map((p) => (
              <TabsTrigger key={p} value={p}>
                {PROFILE_LABELS[p]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={profile} className="mt-6 space-y-6">
            {data?.message && (
              <p
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {data.message}
              </p>
            )}

            {/* Alocação sugerida */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Alocação Sugerida
              </h4>
              <div className="space-y-3">
                {data?.allocation?.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.assetClass}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                        {item.examples?.length
                          ? ` • Ex: ${item.examples.join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Valor sugerido mensal */}
            {data?.suggestedMonthlyAmount !== undefined &&
              data.suggestedMonthlyAmount > 0 && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                  }`}
                >
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Valor sugerido para investir</p>
                    <p className="text-lg font-bold text-emerald-600">
                      R${" "}
                      {data.suggestedMonthlyAmount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      /mês
                    </p>
                  </div>
                </div>
              )}

            {/* Indicadores de oportunidade */}
            {data?.opportunityIndicators?.length ? (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Oportunidades
                </h4>
                <ul className="space-y-1">
                  {data.opportunityIndicators.map((ind, idx) => (
                    <li
                      key={idx}
                      className={`text-sm flex items-start gap-2 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
