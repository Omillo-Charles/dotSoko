"use client";

import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useAuth } from '@/context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  shop?: {
    name: string;
  };
}

interface WishlistContextType {
  wishlistItems: Product[];
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<'added' | 'removed' | null>;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const isSameId = (pid1: any, pid2: any) => {
    const id1 = String(pid1?._id || pid1?.id || pid1);
    const id2 = String(pid2?._id || pid2?.id || pid2);
    return id1 === id2 && id1 !== 'undefined' && id2 !== 'undefined';
  };

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await api.get('/wishlist');
      return response.data.data;
    },
    enabled: !!token,
  });

  const wishlistItems = (wishlistData?.products || []).map((p: any) => {
    if (p && p.id && !p._id) {
      return { ...p, _id: p.id };
    }
    return p;
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.post('/wishlist/toggle', { productId });
      return response.data;
    },
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['products-limited'] });
      await queryClient.cancelQueries({ queryKey: ['products-infinite'] });
      await queryClient.cancelQueries({ queryKey: ['featured-products'] });
      await queryClient.cancelQueries({ queryKey: ['product-feed'] });
      await queryClient.cancelQueries({ queryKey: ['shop-products'] });

      // Snapshot the previous values
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      // Determine if adding or removing
      // Use the most up-to-date wishlist data (including potential previous optimistic updates)
      const currentWishlist: any = previousWishlist || { products: [] };
      const currentlyInWishlist = currentWishlist.products?.some((item: any) => isSameId(item, productId));
      const action = currentlyInWishlist ? 'removed' : 'added';

      // Optimistically update wishlist items
      queryClient.setQueryData(['wishlist'], (old: any) => {
        if (!old) return { products: [] };
        const products = old.products || [];
        if (action === 'added') {
          return { ...old, products: [...products, { _id: productId }] };
        } else {
          return { ...old, products: products.filter((p: any) => !isSameId(p, productId)) };
        }
      });

      return { previousWishlist };
    },
    onError: (error: any, productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      // Always refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    }
  });

  const toggleWishlist = async (productId: string): Promise<'added' | 'removed' | null> => {
    if (!token) {
      toast.error("Please login to manage your wishlist");
      return null;
    }

    try {
      const result = await toggleMutation.mutateAsync(productId);
      return result.action;
    } catch (error) {
      return null;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    await removeMutation.mutateAsync(productId);
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item: any) => isSameId(item, productId));
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      isLoading, 
      toggleWishlist, 
      isInWishlist,
      removeFromWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
