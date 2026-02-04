"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  DollarSign,
} from "lucide-react";

interface Insight {
  type: string;
  title: string;
  description: string;
}

interface InsightsListProps {
  insights: Insight[];
  potentialSavings?: number;
  isLoading?: boolean;
}

export function InsightsList({
  insights,
  potentialSavings,
  isLoading,
}: InsightsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "optimization":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "investment":
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      case "goal":
        return <Target className="h-5 w-5 text-indigo-600" />;
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-orange-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "optimization":
        return "border-blue-200 bg-blue-50";
      case "investment":
        return "border-purple-200 bg-purple-50";
      case "goal":
        return "border-indigo-200 bg-indigo-50";
      case "suggestion":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "optimization":
        return "bg-blue-100 text-blue-800";
      case "investment":
        return "bg-purple-100 text-purple-800";
      case "goal":
        return "bg-indigo-100 text-indigo-800";
      case "suggestion":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "positive":
        return "Positivo";
      case "warning":
        return "Atenção";
      case "optimization":
        return "Otimização";
      case "investment":
        return "Investimento";
      case "goal":
        return "Meta";
      case "suggestion":
        return "Sugestão";
      default:
        return "Insight";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Insights Inteligentes
          {potentialSavings && potentialSavings > 0 && (
            <Badge className="bg-green-100 text-green-800">
              Poupança potencial: R$ {potentialSavings.toFixed(2)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Adicione mais transações para receber insights personalizados
              </p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {insight.title}
                      </h4>
                      <Badge className={getBadgeColor(insight.type)}>
                        {getTypeLabel(insight.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
