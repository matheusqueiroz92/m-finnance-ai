import { useQuery } from '@tanstack/react-query';
import { getAccountSummary } from '@/services/accountService';
import { getTransactionStats } from '@/services/transactionService';
import { getGoalStats } from '@/services/goalService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useAccountSummary(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY],
    queryFn: getAccountSummary,
    enabled: isAuthenticated,
  });
}

export function useTransactionStats(period: 'day' | 'week' | 'month' | 'year', isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION_STATS, period],
    queryFn: () => getTransactionStats(period),
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