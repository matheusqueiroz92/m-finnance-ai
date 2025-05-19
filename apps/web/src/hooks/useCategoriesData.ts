import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/categoryService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { CategoryCreateData, CategoryUpdateData } from '@/types/category';

export function useCategoriesList(categoryType?: 'income' | 'expense' | 'investment', enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, categoryType],
    queryFn: () => getCategories(categoryType),
    enabled,
  });
}

export function useCategoryDetail(categoryId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY_DETAIL(categoryId)],
    queryFn: () => getCategoryById(categoryId),
    enabled: enabled && !!categoryId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CategoryCreateData) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: CategoryUpdateData }) => updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORY_DETAIL(variables.id)] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
    },
  });
}