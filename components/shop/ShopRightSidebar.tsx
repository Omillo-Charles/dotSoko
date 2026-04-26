"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Plus, Send } from "lucide-react";
import { GoldCheck } from "@/components/ui/CommonUI";

interface ShopRightSidebarProps {
  popularShops: any[];
  flashDeals: any[];
  isSeller: boolean;
  isMounted: boolean;
  myShop: any;
  currentUser: any;
  followMutation: any;
  shopsQuery: string;
  isLoading?: boolean;
  isFlashDealsLoading?: boolean;
  onPostProduct: () => void;
  onFollowToggle: (shopId: string) => void;
}

export const ShopRightSidebar = ({
  popularShops,
  flashDeals,
  isSeller,
  isMounted,
  myShop,
  currentUser,
  followMutation,
  shopsQuery,
  isLoading,
  onPostProduct,
  onFollowToggle,
}: ShopRightSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="hidden lg:block w-[320px] shrink-0">
      <aside className="fixed top-[128px] w-[320px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
        
        {/* Popular Shops */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Popular Shops</h3>
          <div className="space-y-1">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : popularShops.length > 0 ? (
              popularShops.map((vendor: any) => (
                <div
                  key={vendor.id}
                  className="p-3 hover:bg-muted transition-all cursor-pointer flex items-center justify-between gap-3 rounded-xl group"
                  onClick={() => router.push(`/shop/${vendor.handle || vendor.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 aspect-square rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                      <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-0.5">
                        <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{vendor.name}</p>
                        {vendor.verified && <GoldCheck className="w-4 h-4" />}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 truncate">{vendor.handle || `@${vendor.name.toLowerCase().replace(/\s+/g, '')}`}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-bold text-muted-foreground">{vendor.followers} followers</p>
                        <span className="text-muted-foreground/40 text-[8px]">·</span>
                        <p className="text-[10px] font-bold text-muted-foreground">{vendor.products} products</p>
                      </div>
                    </div>
                  </div>
                  {isMounted && (!myShop || String(myShop._id || myShop.id) !== String(vendor.id)) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFollowToggle(vendor.id);
                      }}
                      disabled={followMutation.isPending && followMutation.variables === vendor.id}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                        (vendor.isFollowing ?? vendor.followersList?.some((f: any) => String(f._id || f) === String(currentUser?._id)))
                          ? 'bg-muted text-foreground hover:bg-destructive hover:text-white group/btn'
                          : 'bg-foreground text-background hover:bg-primary hover:text-white'
                      } ${followMutation.isPending && followMutation.variables === vendor.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={(vendor.isFollowing ?? vendor.followersList?.some((f: any) => String(f._id || f) === String(currentUser?._id))) ? 'group-hover/btn:hidden' : ''}>
                        {followMutation.isPending && followMutation.variables === vendor.id ? '...' : ((vendor.isFollowing ?? vendor.followersList?.some((f: any) => String(f._id || f) === String(currentUser?._id))) ? 'Following' : 'Follow')}
                      </span>
                      {(vendor.isFollowing ?? vendor.followersList?.some((f: any) => String(f._id || f) === String(currentUser?._id))) && !followMutation.isPending && (
                        <span className="hidden group-hover/btn:inline">Unfollow</span>
                      )}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-black text-foreground uppercase">No shops found</p>
                <p className="text-[10px] font-bold text-muted-foreground/60">Try a different search term</p>
                {shopsQuery && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('shops_q');
                      router.push(`/shop?${params.toString()}`);
                    }}
                    className="text-[10px] font-bold text-primary hover:underline block mx-auto mt-2"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for Sellers */}
        {isSeller && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Quick Actions</h3>
            <div className="space-y-3 px-2">
              <button
                onClick={onPostProduct}
                className="w-full text-left group block relative overflow-hidden rounded-2xl p-5 bg-primary shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Inventory</p>
                    <p className="text-xl font-black text-white leading-tight">POST PRODUCT</p>
                  </div>
                  <Plus className="w-8 h-8 text-white/40 group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              </button>


            </div>
          </div>
        )}

        {/* Flash Deals */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Flash Deals</h3>
          <div className="space-y-4 px-2">
            {flashDeals ? flashDeals.map((product: any, i: number) => (
              <Link
                key={product._id || i}
                href={`/shop/product/${product._id}`}
                className="flex gap-3 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden border border-border shrink-0">
                  {product.images?.[0] || product.image ? (
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted-foreground/10 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <p className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-black text-sm">KES {product.price?.toLocaleString()}</span>
                    {product.oldPrice && (
                      <span className="text-[10px] text-muted-foreground/60 line-through">KES {product.oldPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: i === 0 ? '75%' : '40%' }}></div>
                  </div>
                </div>
              </Link>
            )) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 py-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-1 bg-muted rounded-full w-full" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Links */}
        <div className="px-4 py-4 border-t border-border flex flex-wrap gap-x-4 gap-y-2">
          {[
            { label: 'Terms', href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Help', href: '/help' },
            { label: 'Cookies', href: '/cookies' },
            { label: 'About', href: '/about' }
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <p className="text-[11px] font-bold text-muted-foreground/40 w-full mt-2">© 2026 <span className="text-secondary">.</span>Soko Marketplace</p>
        </div>
      </aside>
    </div>
  );
};
