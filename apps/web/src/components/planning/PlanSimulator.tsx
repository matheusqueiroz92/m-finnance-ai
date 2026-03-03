"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Calculator, TrendingUp } from "lucide-react";
import type { SimulationResult } from "@/types/planning";

interface PlanSimulatorProps {
  result: SimulationResult | null | undefined;
  onParamsChange: (savingsPercent: number, months: number) => void;
  isLoading: boolean;
}

export function PlanSimulator({
  result,
  onParamsChange,
  isLoading,
}: PlanSimulatorProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [savingsPercent, setSavingsPercent] = useState(20);
  const [months, setMonths] = useState(12);

  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(50, Math.max(5, Number(e.target.value) || 20));
    setSavingsPercent(v);
    onParamsChange(v, months);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(60, Math.max(1, Number(e.target.value) || 12));
    setMonths(v);
    onParamsChange(savingsPercent, v);
  };

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
          <Calculator className="h-5 w-5 text-blue-500" />
          Simulador: e se eu poupar X% por Y meses?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Percentual de poupança: {savingsPercent}%</Label>
          <Input
            type="number"
            min={5}
            max={50}
            step={5}
            value={savingsPercent}
            onChange={handleSavingsChange}
            className="max-w-[200px]"
          />
        </div>
        <div className="space-y-2">
          <Label>Meses: {months}</Label>
          <Input
            type="number"
            min={1}
            max={60}
            value={months}
            onChange={handleMonthsChange}
            className="max-w-[200px]"
          />
        </div>

        {isLoading && (
          <div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
        )}

        {result && !isLoading && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              isDark ? "bg-emerald-500/10" : "bg-emerald-50"
            }`}
          >
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">
                Com {result.monthlyIncome > 0 ? `renda de R$ ${result.monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês` : "sua renda"} e {result.savingsPercent}% de poupança
              </p>
              <p className="text-xl font-bold text-emerald-600">
                Total em {result.months} meses: R${" "}
                {result.totalSaved.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
