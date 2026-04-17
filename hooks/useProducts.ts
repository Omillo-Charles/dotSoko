import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface ProductSearchParams {
  q?: string;
  cat?: string;
  following?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  limit?: number;
  page?: number;
}

export const useProducts = (params?: ProductSearchParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await api.get('/products', { 
        params: { limit: 20, ...params } 
      });
      const data = response.data.data || [];
      return data.map((p: any) => ({
        ...p,
        _id: p.id || p._id
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLimitedProducts = (limit: number, otherParams?: any) => {
  return useQuery({
    queryKey: ['products-limited', limit, otherParams],
    queryFn: async () => {
      const response = await api.get('/products', { 
        params: { ...otherParams, limit } 
      });
      const data = response.data.data || [];
      return data.map((p: any) => ({
        ...p,
        _id: p.id || p._id
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfiniteProducts = (params?: any) => {
  return useInfiniteQuery({
    queryKey: ['products-infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/products', { 
        params: { ...params, page: pageParam, limit: 12 } 
      });
      const data = response.data;
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map((p: any) => ({
          ...p,
          _id: p.id || p._id
        }));
      }
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyProducts = () => {
  return useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const response = await api.get('/products/my-products');
      const data = response.data.data || [];
      return data.map((p: any) => ({
        ...p,
        _id: p.id || p._id
      }));
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      const product = response.data.data;
      if (product && !product._id) {
        product._id = product.id;
      }
      return product;
    },
    enabled: !!id && id !== 'undefined',
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useFeaturedProducts = (limit: number = 4) => {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      const response = await api.get('/products', { params: { limit } });
      const data = response.data.data || [];
      return data.map((p: any) => ({
        ...p,
        _id: p.id || p._id
      }));
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const usePersonalizedFeed = (limit: number = 12) => {
  return useQuery({
    queryKey: ['product-feed', limit],
    queryFn: async () => {
      const response = await api.get('/products/feed', { params: { limit } });
      const data = response.data.data || [];
      return data.map((p: any) => ({
        ...p,
        _id: p.id || p._id
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTrackActivity = () => {
  return async (data: { type: string; productId?: string; category?: string; searchQuery?: string }) => {
    try {
      await api.post('/products/track', data);
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };
};
