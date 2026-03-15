"use client";

import React from "react";
import Link from "next/link";
import { 
  Store, 
  Flame, 
  ArrowRight, 
  Star, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Globe
} from "lucide-react";
import { usePopularShops } from "@/hooks/useShop";
import { useProducts } from "@/hooks/useProducts";

export const MarketInsights = () => {
  const { data: popularShops = [], isLoading: isShopsLoading } = usePopularShops(2);
  const { data: trendingProducts = [], isLoading: isProductsLoading } = useProducts({ limit: 2, sort: '-views' });

  if (isShopsLoading || isProductsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 opacity-50">
        <div className="h-64 bg-muted animate-pulse rounded-[3rem]" />
        <div className="h-64 bg-muted animate-pulse rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Similar Shops / Ecosystem Leaders */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Ecosystem Peers</h2>
            </div>
          </div>

          <div className="grid gap-5">
            {popularShops.slice(0, 2).map((shop: any) => (
              <Link 
                key={shop._id || shop.id}
                href={`/shop/${shop.username ? `@${shop.username}` : shop._id}`}
                className="group p-6 bg-background/60 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-sm dark:border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 flex items-center gap-6"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border shadow-sm shrink-0">
                  <img 
                    src={shop.avatar || '/defaultAvatar.jpeg'} 
                    alt={shop.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-foreground text-xl tracking-tight leading-none group-hover:text-primary transition-colors">{shop.name}</h4>
                  <div className="flex items-center gap-3 mt-2 font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                       <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                       {shop.rating || "4.8"}
                    </span>
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                    <span>{shop.followersCount || 0} Followers</span>
                  </div>
                </div>
                <div className="p-3 bg-background/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 border border-border">
                   <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Global Trending Products */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Market Pulse</h2>
            </div>
            <Link href="/shop" className="group flex items-center gap-2.5 text-orange-500 font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all">
              Top Trending
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             {trendingProducts.slice(0, 2).map((product: any) => (
               <Link 
                 key={product._id || product.id}
                 href={`/product/${product._id || product.id}`}
                 className="group relative overflow-hidden bg-background/60 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-sm p-5 hover:shadow-2xl hover:border-orange-500/30 transition-all duration-500"
               >
                 <div className="aspect-square rounded-[2rem] overflow-hidden bg-muted mb-5 border border-border/50 relative">
                   <img 
                     src={product.image || "/placeholder-product.png"} 
                     alt={product.name} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                   />
                   <div className="absolute top-4 right-4 px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-full border border-border shadow-sm text-[9px] font-black uppercase tracking-widest text-orange-500">
                     Hottest
                   </div>
                 </div>
                 <h5 className="font-black text-foreground text-lg tracking-tight truncate leading-none mb-2">{product.name}</h5>
                 <p className="text-orange-500 font-black text-xl italic uppercase tracking-tighter">KES {product.price?.toLocaleString()}</p>
                 
               </Link>
             ))}
          </div>
        </div>

      </div>

      {/* Visual Quote / Motivation */}
      <div className="relative overflow-hidden rounded-[3.5rem] border border-border shadow-sm bg-background/40 backdrop-blur-3xl p-12 text-center group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
         <ActivityIndicator className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-primary/5 pointer-events-none" />
         <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter max-w-2xl mx-auto leading-[1.1]">
              The market is <span className="text-primary italic">evolving</span>. Are you leading the wave?
            </h3>
            <p className="mt-6 text-muted-foreground font-medium text-lg max-w-xl mx-auto">
              Use these insights to stay ahead of the competition and optimize your inventory for growth.
            </p>
         </div>
      </div>
    </div>
  );
};

// Helper SVG component
const ActivityIndicator = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className}>
    <path 
      fill="currentColor" 
      d="M48.7,-68.3C62.9,-60.1,74,-46.3,79.5,-30.7C85.1,-15,85.1,2.5,79.3,17.4C73.6,32.4,62,44.7,49.2,55.1C36.4,65.5,22.4,74.1,6.5,75.2C-9.4,76.4,-27.1,70,-41.8,59.8C-56.5,49.6,-68.2,35.6,-74.3,19.3C-80.4,2.9,-80.9,-15.8,-74.6,-31.6C-68.3,-47.4,-55.1,-60.4,-40.4,-68.4C-25.7,-76.4,-9.4,-79.4,3.7,-84.5C16.8,-89.6,34.5,-76.6,48.7,-68.3Z" 
      transform="translate(100 100)" 
    />
  </svg>
);
