"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Store, CheckCircle2, ArrowRight, User } from "lucide-react";
import { GoldCheck } from "@/components/ui/CommonUI";
import { useRouter, useSearchParams } from "next/navigation";
import { usePopularShops } from "@/hooks/useShop";

interface ShopSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const ShopSearchModal = ({ isOpen, onClose, initialQuery = "" }: ShopSearchModalProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || "");
  const { data: popularShopsData } = usePopularShops();

  const suggestions = useMemo(() => {
    if (!query?.trim() || !popularShopsData) return [];
    
    const q = query.toLowerCase();
    return popularShopsData
      .filter((shop: any) => 
        shop.name?.toLowerCase().includes(q) || 
        (shop.username && `@${shop.username.toLowerCase()}`.includes(q))
      )
      .slice(0, 5); // Limit to 5 suggestions
  }, [query, popularShopsData]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("shops_q", query.trim());
    } else {
      params.delete("shops_q");
    }
    router.push(`/shop?${params.toString()}`);
    onClose();
  };

  const handleSuggestionClick = (shop: any) => {
    const handle = shop.username ? `@${shop.username}` : null;
    const shopIdOrHandle = handle || shop._id || shop.id;
    if (shopIdOrHandle) {
      router.push(`/shop/${shopIdOrHandle}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-0 md:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-background w-full h-full md:h-auto md:max-w-xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-full md:slide-in-from-top-4 duration-500 border-x border-b border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-6 h-6" />
          </button>
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
            <input
              autoFocus
              type="text"
              value={query || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for shops..."
              className="w-full bg-transparent border-none py-3 pl-8 pr-4 text-lg font-bold text-foreground placeholder:text-muted-foreground/30 focus:ring-0 outline-none"
            />
          </form>
          {query.trim() && (
            <button 
              onClick={() => handleSearch()}
              className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {query.trim() && suggestions.length > 0 ? (
            <div className="p-4 space-y-1">
              <h3 className="px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Suggestions</h3>
              {suggestions.map((shop: any) => (
                <button
                  key={shop._id || shop.id}
                  onClick={() => handleSuggestionClick(shop)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted rounded-2xl transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                    {shop.avatar ? (
                      <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-0.5">
                      <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{shop.name}</p>
                      {shop.isVerified && <GoldCheck className="w-3 h-3" />}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 truncate">
                      {shop.username ? `@${shop.username}` : `@${shop.name.toLowerCase().replace(/\s+/g, '')}`}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
              <button
                onClick={() => handleSearch()}
                className="w-full flex items-center gap-3 p-4 text-primary font-bold text-sm hover:bg-primary/5 rounded-2xl transition-all group"
              >
                <Search className="w-4 h-4" />
                <span>Search for "{query}"</span>
              </button>
            </div>
          ) : query.trim() ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground uppercase">No exact matches</p>
                <p className="text-xs font-medium text-muted-foreground">Press enter to see all results for "{query}"</p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center">
                  <Store className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Find your favorite shop</h3>
                  <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
                    Search by shop name or handle to discover amazing products and deals.
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-12 grid grid-cols-1 gap-3">
                {[
                  { label: "Verified Shops", icon: <GoldCheck className="w-4 h-4" />, desc: "Look for the Gold checkmark" },
                  { label: "Top Rated", icon: <Store className="w-4 h-4 text-primary" />, desc: "Shops with high customer ratings" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">{item.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopSearchModal;
