import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoals, getGoalStats, deleteGoal } from '@/services/goalService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useGoalsList(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.GOALS],
    queryFn: () => getGoals(),
    enabled: isAuthenticated,
  });
}

export function useGoalStats(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.GOAL_STATS],
    queryFn: getGoalStats,
    enabled: isAuthenticated,
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOAL_STATS] });
    },
  });
}