"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FinancialScoreProps {
  score: {
    value: number;
    change: number;
  };
  health: string;
  isLoading?: boolean;
}

export function FinancialScore({
  score,
  health,
  isLoading,
}: FinancialScoreProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (value: number) => {
    if (value >= 750) return "text-green-600";
    if (value >= 650) return "text-blue-600";
    if (value >= 550) return "text-yellow-600";
    if (value >= 450) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excelente":
        return "bg-green-100 text-green-800";
      case "Ótima":
        return "bg-blue-100 text-blue-800";
      case "Boa":
        return "bg-yellow-100 text-yellow-800";
      case "Regular":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Score Financeiro
          <Badge className={getHealthColor(health)}>{health}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${getScoreColor(score.value)}`}>
              {score.value}
            </div>
            <div className="flex items-center space-x-2">
              {getChangeIcon(score.change)}
              <span
                className={`text-sm font-medium ${getChangeColor(score.change)}`}
              >
                {score.change > 0 ? "+" : ""}
                {score.change} pontos
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                score.value >= 750
                  ? "bg-green-500"
                  : score.value >= 650
                    ? "bg-blue-500"
                    : score.value >= 550
                      ? "bg-yellow-500"
                      : score.value >= 450
                        ? "bg-orange-500"
                        : "bg-red-500"
              }`}
              style={{ width: `${(score.value / 850) * 100}%` }}
            />
          </div>

          <p className="text-sm text-gray-600">
            Seu score financeiro é baseado em sua taxa de poupança, controle de
            gastos e progresso das metas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
