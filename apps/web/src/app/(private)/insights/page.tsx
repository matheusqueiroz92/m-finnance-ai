"use client";

import React from "react";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PageTitle } from "@/components/shared/PageTitle";
import { FinancialScore } from "@/components/insights/FinancialScore";
import { InsightsList } from "@/components/insights/InsightsList";
import { GoalProgress } from "@/components/insights/GoalProgress";
import {
  useInsightsData,
  useFinancialScore,
  useRecommendations,
  useTrends,
} from "@/hooks/useInsightsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export default function InsightsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const { data: insights, isLoading: insightsLoading } =
    useInsightsData(isAuthenticated);
  const { data: financialScore, isLoading: scoreLoading } =
    useFinancialScore(isAuthenticated);
  const { data: recommendations, isLoading: recommendationsLoading } =
    useRecommendations(isAuthenticated);
  const { data: trends, isLoading: trendsLoading } = useTrends(isAuthenticated);

  if (authLoading) {
    return <LoadingScreen message="Carregando insights..." />;
  }

  const isLoading =
    insightsLoading || scoreLoading || recommendationsLoading || trendsLoading;

  return (
    <div className="space-y-8 p-6 min-h-screen bg-white dark:bg-[#25343b] text-gray-800 dark:text-white transition-colors duration-200">
      {/* Header */}
      <PageTitle
        title="Insights Inteligentes"
        description="Análise avançada da sua saúde financeira com recomendações personalizadas baseadas em IA"
      />

      {/* Score and Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialScore
          score={financialScore?.score || { value: 0, change: 0 }}
          health={financialScore?.health || "Calculando..."}
          isLoading={scoreLoading}
        />

        <GoalProgress
          goalProbability={insights?.goalProbability || 0}
          isLoading={insightsLoading}
        />
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsList
          insights={insights?.insights || []}
          potentialSavings={insights?.potentialSavings || 0}
          isLoading={insightsLoading}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Resumo Financeiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Poupança Potencial</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    R$ {insights?.potentialSavings?.toFixed(2) || "0,00"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Probabilidade das Metas</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {insights?.goalProbability || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Score Financeiro</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {insights?.score?.value || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends and Recommendations */}
      {trends && trends.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5" />
              <span>Tendências e Alertas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.trends.map((trend, index) => (
                <div
                  key={index}
                  className="p-3 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg"
                >
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    {trend.title}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {trend.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && (!insights || insights.insights.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Adicione mais transações
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Para receber insights personalizados, adicione mais transações e
              mantenha seus dados atualizados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
