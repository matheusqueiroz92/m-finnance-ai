import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCreditCards, 
  getCreditCardSummary, 
  getCreditCardBillings, 
  deleteCreditCard,
  getCreditCardById
} from '@/services/creditCardService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useCreditCardsList(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.CREDIT_CARDS],
    queryFn: getCreditCards,
    enabled: isAuthenticated,
  });
}

export function useCreditCardSummary(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.CREDIT_CARD_SUMMARY],
    queryFn: getCreditCardSummary,
    enabled: isAuthenticated,
  });
}

export function useCreditCardDetail(creditCardId: string, isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.CREDIT_CARD_DETAIL(creditCardId)],
    queryFn: () => getCreditCardById(creditCardId),
    enabled: isAuthenticated && !!creditCardId,
  });
}

export function useCreditCardTransactions(isAuthenticated: boolean, creditCardId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CREDIT_CARD_BILLINGS, creditCardId],
    queryFn: () => getCreditCardBillings(creditCardId),
    enabled: isAuthenticated,
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARD_SUMMARY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CREDIT_CARD_BILLINGS] });
    },
  });
}