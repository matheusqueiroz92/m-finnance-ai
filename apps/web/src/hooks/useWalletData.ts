import { useQuery } from '@tanstack/react-query';
import { getAccounts, getAccountSummary } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useAccounts(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: getAccounts,
    enabled: isAuthenticated,
  });
}

export function useAccountSummary(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY],
    queryFn: getAccountSummary,
    enabled: isAuthenticated,
  });
}

export function useRecentTransactions(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, { limit: 3 }],
    queryFn: () => getTransactions({ limit: 3, page: 1 }),
    enabled: isAuthenticated,
  });
}