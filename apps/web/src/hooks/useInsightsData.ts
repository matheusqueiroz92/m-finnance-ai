"use client";

import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";

interface FinancialInsights {
  score: {
    value: number;
    change: number;
  };
  health: string;
  potentialSavings: number;
  goalProbability: number;
  insights: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

interface FinancialScore {
  score: {
    value: number;
    change: number;
  };
  health: string;
}

interface Recommendations {
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  potentialSavings: number;
}

interface Trends {
  goalProbability: number;
  score: {
    value: number;
    change: number;
  };
  trends: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

export function useInsightsData(isAuthenticated: boolean) {
  return useQuery<FinancialInsights>({
    queryKey: ["insights"],
    queryFn: () => reportService.getInsights(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useFinancialScore(isAuthenticated: boolean) {
  return useQuery<FinancialScore>({
    queryKey: ["financial-score"],
    queryFn: () => reportService.getFinancialScore(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRecommendations(isAuthenticated: boolean) {
  return useQuery<Recommendations>({
    queryKey: ["recommendations"],
    queryFn: () => reportService.getRecommendations(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTrends(isAuthenticated: boolean) {
  return useQuery<Trends>({
    queryKey: ["trends"],
    queryFn: () => reportService.getTrends(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
