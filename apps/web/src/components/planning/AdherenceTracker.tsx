"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { AdherenceResult } from "@/types/planning";

interface AdherenceTrackerProps {
  adherence: AdherenceResult | null | undefined;
  isLoading: boolean;
}

export function AdherenceTracker({ adherence, isLoading }: AdherenceTrackerProps) {
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
          <CardTitle>Aderência ao plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!adherence) return null;

  const isGood = adherence.adherenceScore >= 70;

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
          {isGood ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          Aderência ao plano
        </CardTitle>
        <p className="text-sm text-muted-foreground">{adherence.message}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Score de aderência</span>
            <span className="font-semibold">{adherence.adherenceScore}%</span>
          </div>
          <Progress value={adherence.adherenceScore} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Sua alocação atual</p>
            <p className="text-muted-foreground">
              Necessidades {adherence.currentAllocation.needs}% • Desejos{" "}
              {adherence.currentAllocation.wants}% • Poupança{" "}
              {adherence.currentAllocation.savings}%
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Meta (50/30/20)</p>
            <p className="text-muted-foreground">
              Necessidades {adherence.targetAllocation.needs}% • Desejos{" "}
              {adherence.targetAllocation.wants}% • Poupança{" "}
              {adherence.targetAllocation.savings}%
            </p>
          </div>
        </div>

        {adherence.suggestions?.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {adherence.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500">•</span>
                {s}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
