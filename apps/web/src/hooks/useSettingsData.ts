import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, changePassword } from '@/services/authService';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { useAuth } from '@/lib/auth';
import { User, UserUpdateData, ChangePasswordData } from '@/types/user';

export function useProfileUpdate() {
  const queryClient = useQueryClient();
  const { updateUserData } = useAuth();
  
  return useMutation({
    mutationFn: (data: UserUpdateData) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'avatar' && value instanceof File) {
            formData.append('avatar', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      return updateProfile(formData);
    },
    onSuccess: (data: User) => {
      updateUserData(data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
  });
}

export function usePasswordChange() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data),
  });
}

export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}