import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/services/transactionService';
import { getCategories } from '@/services/categoryService';
import { getAccounts } from '@/services/accountService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { TransactionFilters } from '@/types/transaction';

export function useTransactionsList(filters: TransactionFilters, isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, filters],
    queryFn: () => getTransactions(filters),
    enabled: isAuthenticated,
  });
}

export function useCategories(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => getCategories(),
    enabled: isAuthenticated,
  });
}

export function useAccountsList(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: () => getAccounts(),
    enabled: isAuthenticated,
  });
}