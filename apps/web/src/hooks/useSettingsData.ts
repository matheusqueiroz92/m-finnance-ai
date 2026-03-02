import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, changePassword } from "@/services/authService";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { useAuth } from "@/lib/auth";
import { User, UserUpdateData, ChangePasswordData } from "@/types/user";

export function useProfileUpdate() {
  const queryClient = useQueryClient();
  const { updateUserData } = useAuth();

  return useMutation({
    mutationFn: (data: UserUpdateData) => updateProfile(data),
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
