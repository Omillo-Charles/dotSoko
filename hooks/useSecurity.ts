import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useSecurity = () => {
  const router = useRouter();

  const changePassword = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/me');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      router.push('/auth?mode=login');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  });

  return {
    changePassword,
    deleteAccount
  };
};
