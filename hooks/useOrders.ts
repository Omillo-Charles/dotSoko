import { useQuery } from '@tanstack/react-query';
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

export interface ShippingAddress {
  name: string;
  phone: string;
  city: string;
  street: string;
}

export interface Order {
  _id: string;
  user: any;
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders');
      const data = response.data.data || [];
      return data.map((o: any) => ({
        ...o,
        _id: o.id || o._id || `order-${Math.random()}`,
        items: (o.items || []).map((i: any) => ({
          ...i,
          _id: i.id || i._id
        }))
      })) as Order[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      const order = response.data.data;
      if (order) {
        if (order.id && !order._id) order._id = order.id;
        order.items = (order.items || []).map((i: any) => ({
          ...i,
          _id: i.id || i._id
        }));
        if (!order.shippingAddress) order.shippingAddress = {};
      }
      return order as Order;
    },
    enabled: !!orderId,
  });
};
