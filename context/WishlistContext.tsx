"use client";

import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

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
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
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
      const previousProducts = queryClient.getQueryData(['products']);
      const previousFeed = queryClient.getQueryData(['product-feed']);
      const previousShopProducts = queryClient.getQueryData(['shop-products']);
      const previousMyProducts = queryClient.getQueryData(['my-products']);
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

      // Function to update product list
      const updateProductList = (old: any) => {
        if (!old) return old;
        
        // If it's a single product object (e.g., queryKey: ['product', id])
        if (typeof old === 'object' && !Array.isArray(old) && !old.pages) {
          if (isSameId(old, productId)) {
            return {
              ...old,
              likesCount: action === 'added' ? (old.likesCount || 0) + 1 : Math.max(0, (old.likesCount || 0) - 1)
            };
          }
          return old;
        }

        // If it's an array (standard useQuery)
        if (Array.isArray(old)) {
          return old.map((p: any) => {
            if (isSameId(p, productId)) {
              return {
                ...p,
                likesCount: action === 'added' ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1)
              };
            }
            return p;
          });
        }
        // If it's paginated data (useInfiniteQuery)
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((p: any) => {
                if (isSameId(p, productId)) {
                  return {
                    ...p,
                    likesCount: action === 'added' ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1)
                  };
                }
                return p;
              })
            }))
          };
        }
        return old;
      };

      // Pessimistically cancel 'product' queries for this specific ID
      await queryClient.cancelQueries({ queryKey: ['product', productId] });

      // Optimistically update all related queries
      queryClient.setQueriesData({ queryKey: ['products'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['products-limited'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['products-infinite'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['featured-products'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['product-feed'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['shop-products'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['my-products'] }, updateProductList);
      queryClient.setQueriesData({ queryKey: ['product', productId] }, updateProductList);

      return { previousProducts, previousFeed, previousWishlist, previousShopProducts, previousMyProducts };
    },
    onError: (error: any, productId, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueriesData({ queryKey: ['products'] }, context.previousProducts);
      }
      if (context?.previousFeed) {
        queryClient.setQueriesData({ queryKey: ['product-feed'] }, context.previousFeed);
      }
      if (context?.previousShopProducts) {
        queryClient.setQueriesData({ queryKey: ['shop-products'] }, context.previousShopProducts);
      }
      if (context?.previousMyProducts) {
        queryClient.setQueriesData({ queryKey: ['my-products'] }, context.previousMyProducts);
      }
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    },
    onSettled: () => {
      // Always refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-limited'] });
      queryClient.invalidateQueries({ queryKey: ['products-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-feed'] });
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onSuccess: (data, productId) => {
      // Synchronize exact likesCount if backend returned it
      if (data.likesCount !== undefined) {
        const syncLikes = (old: any) => {
          if (!old) return old;
          const updateObj = (p: any) => {
            if (isSameId(p, productId)) {
              return { ...p, likesCount: data.likesCount };
            }
            return p;
          };

          if (Array.isArray(old)) return old.map(updateObj);
          if (old.pages) return { ...old, pages: old.pages.map((page: any) => ({ ...page, data: page.data?.map(updateObj) })) };
          if (typeof old === 'object') return updateObj(old);
          return old;
        };

        queryClient.setQueriesData({ queryKey: ['products'] }, syncLikes);
        queryClient.setQueriesData({ queryKey: ['product-feed'] }, syncLikes);
        queryClient.setQueriesData({ queryKey: ['product', productId] }, syncLikes);
      }
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
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  });

  const toggleWishlist = async (productId: string): Promise<'added' | 'removed' | null> => {
    const token = localStorage.getItem("accessToken");
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
