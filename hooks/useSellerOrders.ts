import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface OrderItem {
  _id: string;
  product: string;
  shop: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    city: string;
    street: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

export const useSellerOrders = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/seller');
      const data = response.data.data || [];
      return data.map((o: any) => ({
        ...o,
        _id: o.id || o._id || `order-${Math.random()}`,
        user: o.user ? {
          ...o.user,
          _id: o.user.id || o.user._id
        } : { name: "Unknown User" },
        items: (o.items || []).map((i: any) => ({
          ...i,
          _id: i.id || i._id
        })),
        shippingAddress: o.shippingAddress || {}
      })) as Order[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    }
  });

  return {
    orders: data || [],
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
};
