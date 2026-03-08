"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Store, 
  CheckCircle2, 
  Users, 
  ShoppingBag, 
  ArrowRight,
  Filter,
  LayoutGrid,
  MapPin,
  Star,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { usePopularShops, useFollowShop, useMyShop } from "@/hooks/useShop";
import { useUser } from "@/hooks/useUser";

const BrandsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useUser();
  const { data: myShop } = useMyShop();
  const { data: shops = [], isLoading } = usePopularShops();
  const followMutation = useFollowShop();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const normalizedShops = useMemo(() => {
    return (shops || []).map((shop: any) => {
      const isFollowing = Boolean(shop.isFollowing) || (Array.isArray(shop.followers) && currentUser && shop.followers.some((f: any) => String(f._id || f) === String(currentUser?._id)));
      
      return {
        ...shop,
        isFollowing: isFollowing,
        productsCount: shop.productsCount || shop.products?.length || 0,
        followersCount: shop.followersCount || shop.followers?.length || 0
      };
    });
  }, [shops, currentUser]);

  const filteredShops = useMemo(() => {
    return normalizedShops.filter((shop: any) => 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [normalizedShops, searchQuery]);

  const handleFollowToggle = async (e: React.MouseEvent, shopId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error("Please login to follow shops");
      router.push("/auth?mode=login");
      return;
    }

    try {
      await followMutation.mutateAsync(shopId);
      toast.success("Updated follow status");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle follow");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Header */}
      <div className="bg-background border-b border-border pt-4 md:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
              Discover <span className="text-primary">Brands</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
              Explore the best stores on <span className="text-secondary">.</span>Soko From fashion to electronics, find verified vendors and follow your favorite brands for the latest updates.
            </p>
            
            {/* Search Bar */}
            <div className="relative group max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search brands by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-background focus:border-primary transition-all text-sm font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-background rounded-[2.5rem] p-6 border border-border animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-muted rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
                <div className="h-10 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-background rounded-[3rem] p-12 md:p-20 border border-border text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-4">
              {searchQuery ? "No brands match your search" : "No brands yet"}
            </h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto mb-8">
              {searchQuery 
                ? "Try searching with a different keyword or browse all available brands." 
                : "We're currently onboarding amazing brands. Check back soon or start your own store!"}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="px-8 py-3 bg-foreground text-background rounded-full font-bold hover:bg-primary transition-all shadow-lg shadow-foreground/10"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map((shop: any) => (
              <div 
                key={shop._id}
                onClick={() => router.push(`/shop/${shop.username ? `@${shop.username}` : shop._id}`)}
                className="group bg-background rounded-[2.5rem] border border-border hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Banner Part */}
                <div className="h-24 bg-muted relative overflow-hidden">
                  {shop.banner ? (
                    <img src={shop.banner} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10" />
                  )}
                </div>

                <div className="p-6 pt-0 flex-1 flex flex-col">
                  {/* Avatar & Header */}
                  <div className="relative z-10 flex items-end gap-4 -mt-10 mb-4 px-2">
                    <div className="w-20 aspect-square rounded-3xl border-4 border-background overflow-hidden bg-muted shadow-xl group-hover:scale-110 transition-transform duration-700">
                      <img 
                        src={shop.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`} 
                        alt={shop.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="pb-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {shop.name}
                        </h3>
                        {shop.isVerified && <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10 shrink-0" />}
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{shop.username ? `@${shop.username}` : `@${shop.name.toLowerCase().replace(/\s+/g, "_")}`}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-6 px-2 leading-relaxed">
                    {shop.description || "Premium quality products and exceptional service."}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-muted/50 p-3 rounded-2xl border border-border flex items-center gap-3">
                      <div className="p-2 bg-background rounded-xl text-primary shadow-sm">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight leading-none mb-1">Followers</p>
                        <p className="text-xs font-black text-foreground">{shop.followersCount || shop.followers?.length || 0}</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-2xl border border-border flex items-center gap-3">
                      <div className="p-2 bg-background rounded-xl text-orange-500 shadow-sm">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight leading-none mb-1">Products</p>
                        <p className="text-xs font-black text-foreground">{shop.productsCount || shop.products?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto flex items-center gap-3">
                    {!isMounted ? (
                      <button 
                        className="flex-1 h-11 rounded-xl text-xs font-black transition-all bg-foreground text-background hover:bg-primary shadow-lg shadow-foreground/10"
                      >
                        Follow
                      </button>
                    ) : (
                      <>
                    {isMounted && (!currentUser || (myShop && String(myShop._id || myShop.id) !== String(shop._id)) || (!myShop && shop.owner !== currentUser?._id)) && (
                      <button 
                        onClick={(e) => handleFollowToggle(e, shop._id)}
                        className={`flex-1 h-11 rounded-xl text-xs font-black transition-all ${
                          shop.isFollowing
                            ? 'bg-muted text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                            : 'bg-foreground text-background hover:bg-primary shadow-lg shadow-foreground/10'
                        }`}
                      >
                        {shop.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                      </>
                    )}
                    <button className="w-11 h-11 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all group/btn shadow-sm">
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
