import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Address {
  id: string;
  _id?: string;
  name: string;
  type: 'home' | 'work' | 'other';
  phone: string;
  city: string;
  street: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading, error } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: async () => {
      const response = await api.get('/users/addresses');
      const data = response.data.data || [];
      return data.map((a: any) => ({
        ...a,
        _id: a.id || a._id
      })) as Address[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addAddress = useMutation({
    mutationFn: async (newAddress: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => {
      const response = await api.post('/users/addresses', newAddress);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Address added successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  });

  const updateAddress = useMutation({
    mutationFn: async ({ addressId, data }: { addressId: string, data: Partial<Address> }) => {
      const response = await api.put(`/users/addresses/${addressId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Address updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update address');
    }
  });

  const deleteAddress = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await api.delete(`/users/addresses/${addressId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Address deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  });

  const setDefaultAddress = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await api.put(`/users/addresses/${addressId}/set-default`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Default address updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update default address');
    }
  });

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
};
