import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useShop = (idOrHandle: string) => {
  return useQuery({
    queryKey: ['shop', idOrHandle],
    queryFn: async () => {
      // Check if it's a handle (starts with @)
      const endpoint = idOrHandle.startsWith('@') 
        ? `/shops/handle/${idOrHandle.substring(1)}` 
        : `/shops/${idOrHandle}`;
        
      const response = await api.get(endpoint);
      const shopData = response.data.data || response.data;
      
      // If the data is empty or missing name, it might be an unsuccessful response
      if (!shopData || (typeof shopData === 'object' && !shopData.name && !shopData.id && !shopData._id)) {
        throw new Error("Shop not found");
      }

      // Map id to _id for backward compatibility
      if (shopData && shopData.id && !shopData._id) {
        shopData._id = shopData.id;
      }
      
      return shopData;
    },
    enabled: !!idOrHandle && idOrHandle !== 'undefined',
    staleTime: 0, // Ensure we always get fresh data for profile
  });
};

export const useMyShop = () => {
  return useQuery({
    queryKey: ['my-shop'],
    queryFn: async () => {
      const response = await api.get('/shops/my-shop');
      const data = response.data.data;
      if (data && data.id && !data._id) {
        data._id = data.id;
      }
      return data;
    },
    retry: false, // Don't retry if shop not found (likely 404 means redirect to register)
  });
};

export const useShopProducts = (idOrHandle: string, params?: { 
  limit?: number; 
  minPrice?: number; 
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
}) => {
  return useQuery({
    queryKey: ['shop-products', idOrHandle, params],
    queryFn: async () => {
      // Check if it's a handle (starts with @)
      const endpoint = idOrHandle.startsWith('@')
        ? `/products/shop/handle/${idOrHandle.substring(1)}`
        : `/products/shop/${idOrHandle}`;

      const response = await api.get(endpoint, {
        params: { limit: 20, ...params }
      });
      const data = response.data.data || [];
      return data.map((p: any) => ({
        ...p,
        _id: p.id || p._id || `prod-${Math.random()}`
      }));
    },
    enabled: !!idOrHandle && idOrHandle !== 'undefined',
  });
};

export const usePopularShops = (limit?: number) => {
  return useQuery({
    queryKey: ['popular-shops', limit],
    queryFn: async () => {
      const response = await api.get('/shops', {
        params: { limit }
      });
      return response.data.data;
    },
  });
};

export const useShops = (params?: {
  q?: string;
  category?: string;
  verified?: boolean;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'popular' | 'products';
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: async () => {
      const response = await api.get('/shops', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useShopLists = (idOrHandle: string, type: 'Followers' | 'Following') => {
  return useQuery({
    queryKey: ['shop-lists', idOrHandle, type],
    queryFn: async () => {
      const isHandle = idOrHandle.startsWith('@');
      const cleanHandle = isHandle ? idOrHandle.substring(1) : idOrHandle;
      
      const endpoint = type === 'Followers' 
        ? (isHandle ? `/shops/handle/${cleanHandle}/followers` : `/shops/${idOrHandle}/followers`)
        : (isHandle ? `/shops/handle/${cleanHandle}/following` : `/shops/${idOrHandle}/following`);

      try {
        const response = await api.get(endpoint);
        if (response.data.success) {
          return response.data.data || (type === 'Followers' ? response.data.followers : response.data.following) || [];
        }
        return [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!idOrHandle && (type === 'Followers' || type === 'Following'),
    staleTime: 30000, 
  });
};

export const useShopReviews = (idOrHandle: string) => {
  return useQuery({
    queryKey: ['shop-reviews', idOrHandle],
    queryFn: async () => {
      const endpoint = idOrHandle.startsWith('@')
        ? `/shops/handle/${idOrHandle.substring(1)}/reviews`
        : `/shops/${idOrHandle}/reviews`;
        
      const response = await api.get(endpoint);
      return response.data.data;
    },
    enabled: !!idOrHandle && idOrHandle !== 'undefined',
  });
};

export const useFollowShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shopId: string) => {
      const response = await api.post(`/shops/${shopId}/follow`);
      return response.data;
    },
    onMutate: async (shopId) => {
      await queryClient.cancelQueries({ queryKey: ['shop'] });
      await queryClient.cancelQueries({ queryKey: ['popular-shops'] });
      await queryClient.cancelQueries({ queryKey: ['user-me'] });

      const currentUser: any = queryClient.getQueryData(['user-me']);
      const userId = currentUser?._id || currentUser?.id;

      const toggleShop = (shop: any) => {
        if (!shop) return shop;
        const sid = shop._id || shop.id;
        if (String(sid) !== String(shopId)) return shop;

        const isFollowing = Boolean(shop.isFollowing) || 
                          (Array.isArray(shop.followersList) && userId && shop.followersList.some((f: any) => String(f._id || f) === String(userId))) ||
                          (Array.isArray(shop.followers) && userId && shop.followers.some((f: any) => String(f._id || f) === String(userId)));
        
        const nextFollowing = !isFollowing;
        const count = Number(shop.followersCount ?? shop._count?.followers ?? shop.followers?.length ?? 0);
        
        return {
          ...shop,
          isFollowing: nextFollowing,
          followersCount: Math.max(0, count + (nextFollowing ? 1 : -1)),
        };
      };

      queryClient.setQueriesData({ queryKey: ['shop'] }, (old: any) => {
        if (!old) return old;
        return toggleShop(old);
      });

      queryClient.setQueriesData({ queryKey: ['popular-shops'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(toggleShop);
      });

      return { shopId };
    },
    onError: (err, shopId, context) => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['popular-shops'] });
    },
    onSettled: (data, error, shopId) => {
      queryClient.invalidateQueries({ queryKey: ['shop-lists'] });
      queryClient.invalidateQueries({ queryKey: ['my-shop'] });
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['popular-shops'] });
    },
  });
};

export const useSellerAnalytics = (period: string = '30') => {
  return useQuery({
    queryKey: ['seller-analytics', period],
    queryFn: async () => {
      const response = await api.get('/shops/my-shop/analytics', {
        params: { period }
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRateShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, rating }: { shopId: string; rating: number }) => {
      const response = await api.post(`/shops/${shopId}/rate`, { rating });
      return response.data;
    },
    onSettled: (_data, _error, { shopId }) => {
      queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      queryClient.invalidateQueries({ queryKey: ['shop-reviews', shopId] });
    },
  });
};
