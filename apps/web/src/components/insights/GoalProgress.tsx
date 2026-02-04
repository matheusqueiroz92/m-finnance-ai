"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

interface GoalProgressProps {
  goalProbability: number;
  isLoading?: boolean;
}

export function GoalProgress({
  goalProbability,
  isLoading,
}: GoalProgressProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso das Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-blue-600";
    if (probability >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getProbabilityLabel = (probability: number) => {
    if (probability >= 80) return "Excelente";
    if (probability >= 60) return "Boa";
    if (probability >= 40) return "Regular";
    return "Baixa";
  };

  const getProgressColor = (probability: number) => {
    if (probability >= 80) return "bg-green-500";
    if (probability >= 60) return "bg-blue-500";
    if (probability >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Progresso das Metas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getProbabilityColor(goalProbability)}`}
            >
              {goalProbability}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Probabilidade de atingir suas metas
            </p>
            <p
              className={`text-sm font-medium ${getProbabilityColor(goalProbability)}`}
            >
              {getProbabilityLabel(goalProbability)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{goalProbability}%</span>
            </div>
            <Progress value={goalProbability} className="h-2" />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>
              {goalProbability >= 80
                ? "Você está no caminho certo para atingir suas metas!"
                : goalProbability >= 60
                  ? "Continue assim! Você está progredindo bem."
                  : goalProbability >= 40
                    ? "Considere ajustar suas metas ou aumentar a poupança."
                    : "Revisite suas metas e estratégias de poupança."}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
