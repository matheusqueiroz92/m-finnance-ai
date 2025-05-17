import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, getAccountSummary, deleteAccount, getAccountById } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useAccountsList(isAuthenticated: boolean) {
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

export function useAccountDetail(accountId: string, isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_DETAIL(accountId)],
    queryFn: () => getAccountById(accountId),
    enabled: isAuthenticated && !!accountId,
  });
}

export function useRecentAccountTransactions(isAuthenticated: boolean, accountId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, { limit: 5, account: accountId }],
    queryFn: () => getTransactions({ 
      limit: 5, 
      page: 1,
      account: accountId
    }),
    enabled: isAuthenticated,
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_SUMMARY] });
    },
  });
}