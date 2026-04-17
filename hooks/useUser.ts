import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const useUser = () => {
  const queryClient = useQueryClient();
  const { user: contextUser, token, isProcessing, login, logout, updateUser } = useAuth();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      if (!token) return null;
      
      try {
        const response = await api.get('/users/me');
        if (response.data.success) {
          const userData = response.data.data;
          if (userData && userData.id && !userData._id) {
            userData._id = userData.id;
          }
          // Sync with context
          updateUser(userData);
          return userData;
        }
        return null;
      } catch (err) {
        // If 401, logout is handled by Axios interceptor or manually here
        return null;
      }
    },
    // Only run if we have a token
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const updateAccountTypeMutation = useMutation({
    mutationFn: async (accountType: 'buyer' | 'seller') => {
      const response = await api.put('/users/update-account-type', { accountType });
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-me'], updatedUser);
      updateUser(updatedUser);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData | { name?: string; avatar?: string }) => {
      const response = await api.put('/users/me', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-me'], updatedUser);
      updateUser(updatedUser);
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/users/me/password', data);
      return response.data;
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.delete('/users/me', { data });
      return response.data;
    },
    onSuccess: () => {
      logout();
    }
  });

  return { 
    user: user || contextUser, 
    token, 
    isLoading: isLoading || isProcessing, // Also "loading" if we are processing a social login
    isProcessing,
    error: error as any,
    login,
    logout,
    updateAccountType: updateAccountTypeMutation.mutateAsync,
    isUpdatingAccountType: updateAccountTypeMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updatePassword: updatePasswordMutation.mutateAsync,
    isUpdatingPassword: updatePasswordMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
    refreshUser: () => queryClient.invalidateQueries({ queryKey: ['user-me'] })
  };
};
