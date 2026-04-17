"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id?: string;
  _id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  shop?: {
    id?: string;
    _id?: string;
    name: string;
  };
}

interface CartItem {
  id?: string;
  _id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, size?: string, color?: string, image?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/carts');
      return response.data.data;
    },
    enabled: !!token,
  });

  const cartItems = cartData?.items || [];

  const addMutation = useMutation({
    mutationFn: async (payload: { productId: string, quantity: number, size?: string, color?: string, image?: string }) => {
      const response = await api.post('/carts/add', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success("Item added to cart");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.delete(`/carts/item/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      const response = await api.put(`/carts/item/${itemId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/carts/clear');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const addToCart = async (productId: string, quantity = 1, size?: string, color?: string, image?: string) => {
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }
    await addMutation.mutateAsync({ productId, quantity, size, color, image });
  };

  const removeFromCart = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await updateMutation.mutateAsync({ itemId, quantity });
  };

  const clearCart = async () => {
    await clearMutation.mutateAsync();
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc: number, item: CartItem) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      isLoading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      subtotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
