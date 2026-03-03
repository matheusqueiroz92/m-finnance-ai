import { useQuery } from "@tanstack/react-query";
import { getPlan, simulateScenario, getAdherence } from "@/services/planningService";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

export function usePlan(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.PLANNING_PLAN],
    queryFn: getPlan,
    enabled: isAuthenticated,
  });
}

export function useSimulateScenario(
  savingsPercent: number,
  months: number,
  isAuthenticated: boolean
) {
  return useQuery({
    queryKey: [QUERY_KEYS.PLANNING_SIMULATE, savingsPercent, months],
    queryFn: () => simulateScenario(savingsPercent, months),
    enabled: isAuthenticated && savingsPercent > 0 && months > 0,
  });
}

export function useAdherence(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.PLANNING_ADHERENCE],
    queryFn: getAdherence,
    enabled: isAuthenticated,
  });
}
