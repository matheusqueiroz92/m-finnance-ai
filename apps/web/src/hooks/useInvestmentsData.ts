import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getInvestments, 
  getInvestmentSummary, 
  getInvestmentPerformance, 
  deleteInvestment,
  getInvestmentById
} from '@/services/investmentService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useInvestmentList(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVESTMENTS],
    queryFn: getInvestments,
    enabled: isAuthenticated,
  });
}

export function useInvestmentSummary(isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVESTMENT_SUMMARY],
    queryFn: getInvestmentSummary,
    enabled: isAuthenticated,
  });
}

export function useInvestmentDetail(investmentId: string, isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVESTMENT_DETAIL(investmentId)],
    queryFn: () => getInvestmentById(investmentId),
    enabled: isAuthenticated && !!investmentId,
  });
}

export function useInvestmentPerformance(period: 'month' | 'quarter' | 'year', isAuthenticated: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVESTMENT_PERFORMANCE, period],
    queryFn: () => getInvestmentPerformance(period),
    enabled: isAuthenticated,
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTMENT_SUMMARY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTMENT_PERFORMANCE] });
    },
  });
}