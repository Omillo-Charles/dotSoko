"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  ShoppingBag, 
  MessageCircle, 
  Repeat2, 
  Heart, 
  Share2,
  TrendingUp,
  LayoutGrid,
  List,
  Info,
  Plus,
  ArrowRight,
  ShoppingCart,
  Send
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GoldCheck } from "@/components/GoldCheck";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { categories as allCategories } from "@/constants/categories";
import { toast } from "sonner";

import { useProducts, useLimitedProducts, usePersonalizedFeed, useTrackActivity, useMyProducts } from "@/hooks/useProducts";
import { usePopularShops, useFollowShop, useMyShop } from "@/hooks/useShop";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import RatingModal from "@/components/RatingModal";
import ShareModal from "@/components/ShareModal";
import CommentModal from "@/components/CommentModal";
import ShopSearchModal from "@/components/ShopSearchModal";
import { RepostModal } from "@/components/RepostModal";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CreateUpdateModal } from "@/components/CreateUpdateModal";
import ProductCreateModal from "@/components/ProductCreateModal";

const ShopContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const cat = searchParams.get("cat") || "all";
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const trackActivity = useTrackActivity();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const { user: currentUser } = useUser();
  const { data: myShop } = useMyShop();
  const queryClient = useQueryClient();
  const { data: popularShopsData, isLoading: isShopsLoading } = usePopularShops(4);
  const shopsQuery = searchParams.get("shops_q") || "";
  const { data: flashDealsData } = useLimitedProducts(3);
  const followMutation = useFollowShop();

  const [isMounted, setIsMounted] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [debouncedPriceRange, setDebouncedPriceRange] = useState({ min: '', max: '' });

  const { data: feedProducts, isLoading: isFeedLoading } = usePersonalizedFeed(24);

  // Debounce price range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Track category changes
  useEffect(() => {
    if (cat && cat !== 'all') {
      trackActivity({
        type: 'view',
        category: cat
      });
    }
  }, [cat]);

  // Track searches
  useEffect(() => {
    if (query) {
      trackActivity({
        type: 'search',
        searchQuery: query
      });
    }
  }, [query]);

  // Rating Modal State
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
    initialRating: number;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
    initialRating: 0
  });

  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: ""
  });

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: "",
    title: ""
  });

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [desktopSearchQuery, setDesktopSearchQuery] = useState(shopsQuery || "");
  const [showDesktopSuggestions, setShowDesktopSuggestions] = useState(false);

  const [repostPopover, setRepostPopover] = useState<{
    isOpen: boolean;
    productId: string | null;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    productId: null,
    position: { top: 0, left: 0 },
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Sync search query with URL params
  useEffect(() => {
    setDesktopSearchQuery(shopsQuery || "");
  }, [shopsQuery]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isSeller = isMounted && (currentUser?.accountType === 'seller' || !!myShop);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show if scrolling up or at the top
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowFab(false);
      } else {
        setShowFab(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const { data: productsData, isLoading: isProductsLoading, error: productsError } = useProducts({
    q: query,
    cat: cat !== 'all' ? cat : undefined,
    following: activeTab === 'following' ? 'true' : undefined,
    minPrice: debouncedPriceRange.min ? parseFloat(debouncedPriceRange.min) : undefined,
    maxPrice: debouncedPriceRange.max ? parseFloat(debouncedPriceRange.max) : undefined,
  });

  const products = activeTab === 'foryou' && !query && cat === 'all' && !debouncedPriceRange.min && !debouncedPriceRange.max
    ? (feedProducts || [])
    : (productsData || []);

  const isLoading = isProductsLoading || (activeTab === 'foryou' && isFeedLoading);
  const error = productsError ? (productsError as any).response?.data?.message || "Failed to load products" : null;

  const handleProductClick = (p: any) => {
    const id = p._id || p.id;
    if (id) {
      trackActivity({
        type: 'click',
        productId: id,
        category: p.category
      });
      router.push(`/shop/product/${id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    const id = p._id || p.id;
    if (id) {
      trackActivity({
        type: 'cart',
        productId: id,
        category: p.category
      });
      addToCart(id);
    }
  };

  const handleWishlist = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    const id = p._id || p.id;
    if (id) {
      if (!isInWishlist(id)) {
        trackActivity({
          type: 'wishlist',
          productId: id,
          category: p.category
        });
      }
      toggleWishlist(id);
    }
  };

  const displayProducts = React.useMemo(() => {
    let filtered = products;

    // Filter out user's own shop products from the "Following" tab
    if (activeTab === 'following' && myShop) {
      const myShopId = myShop._id || myShop.id;
      filtered = products.filter((p: any) => {
        const productShopId = p.shop?._id || p.shop?.id || p.shop;
        return String(productShopId) !== String(myShopId);
      });
    }

    return filtered;
  }, [products, activeTab, myShop]);

  const popularShops = React.useMemo(() => {
    let shops = (popularShopsData || []).map((s: any) => {
      const isFollowing = Boolean(s.isFollowing) || (Array.isArray(s.followersList) && currentUser && s.followersList.some((f: any) => String(f._id || f) === String(currentUser?._id)));
      
      return {
        id: s._id || s.id || `shop-${Math.random()}`,
        name: s.name || "Unknown Shop",
        handle: s.username ? `@${s.username}` : null,
        avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name || "shop"}`,
        followers: s.followersCount || s.followers?.length || 0,
        verified: s.isVerified || false,
        isFollowing: isFollowing,
        products: s.productsCount || s.products?.length || 0
      };
    });

    if (shopsQuery) {
      const q = shopsQuery.toLowerCase();
      shops = shops.filter((s: any) => 
        s.name.toLowerCase().includes(q) || 
        (s.handle && s.handle.toLowerCase().includes(q))
      );
    }

    return shops;
  }, [popularShopsData, shopsQuery]);

  const desktopSuggestions = React.useMemo(() => {
    if (!desktopSearchQuery.trim()) return [];
    const q = desktopSearchQuery.toLowerCase();
    return popularShops.filter((shop: any) => 
      shop.name.toLowerCase().includes(q) || 
      (shop.handle && shop.handle.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [desktopSearchQuery, popularShops]);

  const handleFollowToggle = async (shopId: string) => {
    if (!currentUser) {
      toast.error("Please login to follow shops");
      router.push("/auth?mode=login");
      return;
    }

    try {
      await followMutation.mutateAsync(shopId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle follow");
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const categories = allCategories.filter(c => c.value !== 'all');

  const handleCategoryClick = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', categoryValue);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (desktopSearchQuery.trim()) {
      params.set('shops_q', desktopSearchQuery.trim());
    } else {
      params.delete('shops_q');
    }
    router.push(`/shop?${params.toString()}`);
    setShowDesktopSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px]">
        
        {/* Left Sidebar - Categories & Filters */}
        <div className="hidden lg:block w-[280px] shrink-0">
          <aside className="fixed top-[128px] w-[280px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
            {/* Search */}
            <div className="relative group">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  name="q"
                  type="text" 
                  value={desktopSearchQuery || ""}
                  onChange={(e) => {
                    setDesktopSearchQuery(e.target.value);
                    setShowDesktopSuggestions(true);
                  }}
                  onFocus={() => setShowDesktopSuggestions(true)}
                  placeholder="Search shops..." 
                  className="w-full bg-muted border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </form>

              {/* Desktop Suggestions Dropdown */}
              {showDesktopSuggestions && desktopSearchQuery.trim() && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDesktopSuggestions(false)} 
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {desktopSuggestions.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {desktopSuggestions.map((shop: any) => (
                          <button
                            key={shop.id}
                            onClick={() => {
                              router.push(`/shop/${shop.handle || shop.id}`);
                              setShowDesktopSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-all group text-left"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                              <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">{shop.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground/60 truncate">{shop.handle}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                        <button
                          onClick={() => handleSearch({ preventDefault: () => {} } as any)}
                          className="w-full flex items-center gap-2 p-2 text-primary font-bold text-[10px] hover:bg-primary/5 rounded-xl transition-all"
                        >
                          <Search className="w-3 h-3" />
                          <span>Search for "{desktopSearchQuery}"</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground">No exact matches found</p>
                        <button
                          onClick={() => handleSearch({ preventDefault: () => {} } as any)}
                          className="mt-2 text-primary text-[10px] font-black uppercase hover:underline"
                        >
                          See all results
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className="mt-2 px-2">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                  Press Enter to search shops
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Categories</h3>
                {cat !== 'all' && (
                  <button 
                    onClick={() => handleCategoryClick('all')}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button 
                      key={category.value}
                      onClick={() => handleCategoryClick(category.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                        cat === category.value 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        cat === category.value 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                      </div>
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Price Range</h3>
                {(priceRange.min || priceRange.max) && (
                  <button 
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="px-2 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30">KES</span>
                    <input 
                      type="number" 
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      placeholder="Min" 
                      className="w-full bg-muted border-none rounded-xl py-2 pl-8 pr-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/30 transition-all" 
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30">KES</span>
                    <input 
                      type="number" 
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      placeholder="Max" 
                      className="w-full bg-muted border-none rounded-xl py-2 pl-8 pr-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/30 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Middle Feed - Products */}
        <main className="flex-1 min-w-0 border-x border-border pb-24 lg:pb-0">
          {/* Header - Twitter Style */}
          <div className="sticky top-[80px] md:top-[128px] bg-background/80 backdrop-blur-md z-30 border-b border-border">
            <div className="px-4 py-2 md:py-4 flex items-center justify-between">
              <h1 className="text-xl font-black text-foreground">Explore</h1>
              <button 
                onClick={() => setIsSearchModalOpen(true)}
                className="lg:hidden p-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-2xl transition-all active:scale-95"
                title="Search Shops"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className="flex">
              {[
                { id: 'foryou', label: 'For You' },
                { id: 'following', label: 'Following' },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'foryou' | 'following')}
                  className="flex-1 hover:bg-muted/50 transition-colors relative h-14 flex items-center justify-center group"
                >
                  <span className={`text-sm font-bold ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 h-1 w-16 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Quick Actions for Sellers */}
          {isSeller && (
            <div className="lg:hidden border-b border-border bg-muted/20 px-4 py-4 space-y-3">
               <div className="flex items-center justify-between mb-1">
                 <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Seller Hub</h3>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setShowProductModal(true)}
                   className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-primary/10 active:scale-95 transition-all"
                 >
                   <Plus className="w-4 h-4" />
                   POST PRODUCT
                 </button>
                 <button 
                   onClick={() => setIsUpdateModalOpen(true)}
                   className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-secondary/10 active:scale-95 transition-all"
                 >
                   <Send className="w-4 h-4" />
                   ADD UPDATE
                 </button>
               </div>
            </div>
          )}

          {/* Product Feed */}
          <div>
            {/* Mobile Shop Search Results */}
            {shopsQuery && (
              <div className="lg:hidden border-b border-border bg-muted/30">
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shop Results</h3>
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('shops_q');
                      router.push(`/shop?${params.toString()}`);
                    }}
                    className="text-[10px] font-bold text-primary"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex overflow-x-auto pb-4 px-4 gap-3 no-scrollbar">
                  {popularShops.length > 0 ? (
                    popularShops.map((vendor: any) => (
                      <div 
                        key={vendor.id}
                        onClick={() => router.push(`/shop/${vendor.handle || vendor.id}`)}
                        className="shrink-0 w-[200px] p-4 bg-background border border-border rounded-2xl space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                            <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-0.5">
                              <p className="text-xs font-black text-foreground truncate">{vendor.name}</p>
                              {vendor.verified && <GoldCheck className="w-3.5 h-3.5" />}
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground truncate">{vendor.handle}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-muted-foreground">
                            {vendor.followers} followers
                          </div>
                          {isMounted && (!myShop || String(myShop._id || myShop.id) !== String(vendor.id)) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollowToggle(vendor.id);
                              }}
                              className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                vendor.isFollowing
                                  ? 'bg-muted text-foreground'
                                  : 'bg-foreground text-background'
                              }`}
                            >
                              {vendor.isFollowing ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-8 text-center bg-background rounded-2xl border border-border border-dashed">
                      <p className="text-xs font-bold text-muted-foreground">No shops found for "{shopsQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-sm">Loading products...</p>
              </div>
            ) : error ? (
              <div className="p-20 flex flex-col items-center justify-center text-destructive gap-4">
                <Info className="w-10 h-10" />
                <p className="font-bold text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-muted text-muted-foreground rounded-full text-xs font-bold hover:bg-muted/80 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-6 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mb-2">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <div className="space-y-2 max-w-xs">
                  <p className="font-black text-foreground text-lg uppercase tracking-tight">
                    {isMounted && activeTab === 'following' && !currentUser 
                      ? "Login Required" 
                      : query 
                        ? "No product found"
                        : "No products yet"}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {isMounted && activeTab === 'following' && !currentUser
                      ? "Sign in to your account to view updates from your favorite shops."
                      : query
                        ? `We couldn't find any matches for "${query}" across our categories.`
                        : "Be the first to post something amazing in this category!"}
                  </p>
                </div>
                {isMounted && activeTab === 'following' && !currentUser ? (
                  <Link 
                    href="/auth?mode=login"
                    className="mt-2 px-8 py-3.5 bg-foreground text-background rounded-2xl text-sm font-bold shadow-xl shadow-foreground/10 hover:bg-primary transition-all"
                  >
                    Login Now
                  </Link>
                ) : query ? (
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('q');
                      router.push(`/shop?${params.toString()}`);
                    }}
                    className="mt-2 px-8 py-3.5 bg-muted text-muted-foreground rounded-2xl text-sm font-bold hover:bg-muted/80 transition-all"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link 
                    href="/account/seller/products?action=add"
                    className="mt-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Post a Product
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border bg-background">
                {displayProducts.map((product: any) => (
                  <div 
                    key={product._id || product.id} 
                    onClick={() => handleProductClick(product)}
                    className="p-4 md:p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3 md:gap-4">
                      {/* Profile Image */}
                      <div className="shrink-0">
                        <div 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const handle = product.shop?.username ? `@${product.shop.username}` : (product.vendor?.handle ? (product.vendor.handle.startsWith('@') ? product.vendor.handle : `@${product.vendor.handle}`) : null);
                            const shopIdOrHandle = handle || product.shop?._id || product.shop?.id || product.shop || product.vendor?.id;
                            if (shopIdOrHandle) router.push(`/shop/${shopIdOrHandle}`);
                          }}
                          className="w-12 h-12 rounded-full overflow-hidden border border-border bg-muted hover:opacity-90 transition-opacity"
                        >
                          <img 
                            src={product.shop?.avatar || product.vendor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.shop?.name || product.vendor?.name || 'shop'}`} 
                            alt={product.shop?.name || product.vendor?.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        {/* Header: Name, Handle, Time */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                const handle = product.shop?.username ? `@${product.shop.username}` : (product.vendor?.handle ? (product.vendor.handle.startsWith('@') ? product.vendor.handle : `@${product.vendor.handle}`) : null);
                                const shopIdOrHandle = handle || product.shop?._id || product.shop?.id || product.shop || product.vendor?.id;
                                if (shopIdOrHandle) router.push(`/shop/${shopIdOrHandle}`);
                              }}
                              className="text-sm font-black text-foreground truncate hover:underline flex items-center gap-0.5"
                            >
                              {product.shop?.name || product.vendor?.name}
                              {(product.shop?.isVerified || product.vendor?.verified) && <GoldCheck className="w-4 h-4" />}
                            </span>
                            {(product.shop?.username || product.vendor?.handle) && (
                              <span className="text-muted-foreground text-xs truncate">@{product.shop?.username || product.vendor?.handle?.replace('@', '')}</span>
                            )}
                            <span className="text-muted-foreground/60 text-xs shrink-0">· {product.time || new Date(product.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setRatingModal({
                                  isOpen: true,
                                  productId: product._id || product.id,
                                  productName: product.name,
                                  initialRating: product.rating
                                });
                              }}
                              className="text-muted-foreground/40 hover:text-amber-500 p-1.5 rounded-full hover:bg-amber-500/10 transition-all"
                              title="Rate Product"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Product Content */}
                        <p className="text-foreground/90 text-[13px] leading-relaxed mb-3 whitespace-pre-wrap">
                          {product.description || product.content}
                        </p>

                        {/* Product Image */}
                        {(product.images?.[0] || product.image) && (
                          <div className="rounded-[1.25rem] overflow-hidden border border-border mb-3 bg-muted relative aspect-[4/5] sm:aspect-square flex items-center justify-center">
                            <ImageCarousel 
                              images={product.images?.length > 0 ? product.images : [product.image]} 
                              alt={product.name} 
                            />
                            <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-xl shadow-foreground/5 flex flex-col items-end">
                              <span className="text-primary font-black text-sm">KES {product.price.toLocaleString()}</span>
                              {product.averageRating > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  <span className="text-[10px] font-black text-amber-600">{product.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons: Twitter Style */}
                        <div className="flex items-center justify-between max-w-md text-muted-foreground -ml-2">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setCommentModal({
                                isOpen: true,
                                productId: product._id || product.id,
                                productName: product.name
                              });
                            }}
                            className="flex items-center gap-0 group transition-colors hover:text-primary"
                          >
                            <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                              <MessageCircle className="w-[18px] h-[18px]" />
                            </div>
                            <span className="text-xs font-bold">{product.commentsCount || product.comments || 0}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setRepostPopover({
                                isOpen: repostPopover.productId !== product._id,
                                productId: product._id,
                                position: {
                                  top: rect.bottom + window.scrollY + 5,
                                  left: rect.right + window.scrollX - 100,
                                },
                              });
                            }}
                            className="flex items-center gap-0 group transition-colors hover:text-emerald-500"
                          >
                            <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                              <Repeat2 className="w-[18px] h-[18px]" />
                            </div>
                            <span className="text-xs font-bold">{product.reposts || 0}</span>
                          </button>

                          <button 
                            onClick={(e) => handleWishlist(e, product)}
                            className={`flex items-center gap-0 group transition-colors ${
                              isInWishlist(product._id || product.id) ? 'text-pink-500' : 'hover:text-pink-500'
                            }`}
                          >
                            <div className={`p-1.5 rounded-full transition-colors ${
                              isInWishlist(product._id || product.id) ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'
                            }`}>
                              <Heart className={`w-[18px] h-[18px] ${isInWishlist(product._id || product.id) ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-xs font-bold">{product.likesCount || product.likes || 0}</span>
                          </button>

                          <button 
                            onClick={(e) => { 
                              if (product.sizes?.length > 0 || product.colors?.length > 0) {
                                handleProductClick(product);
                              } else {
                                handleAddToCart(e, product);
                              }
                            }}
                            className="flex items-center gap-0 group transition-colors hover:text-primary"
                          >
                            <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                              <ShoppingCart className="w-[18px] h-[18px]" />
                            </div>
                            <span className="text-xs font-bold">Add to Cart</span>
                          </button>

                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              const productUrl = `${window.location.origin}/shop/product/${product._id || product.id}`;
                              setShareModal({
                                isOpen: true,
                                url: productUrl,
                                title: product.name
                              });
                            }}
                            className="flex items-center gap-2 group transition-colors hover:text-foreground"
                          >
                            <div className="p-2 rounded-full group-hover:bg-muted transition-colors">
                              <Share2 className="w-[18px] h-[18px]" />
                            </div>
                          </button>

                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              // Placeholder for future functionality
                            }}
                            className="flex items-center gap-2 group transition-colors hover:text-primary"
                          >
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                              <Send className="w-[18px] h-[18px]" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <RatingModal 
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
          productId={ratingModal.productId}
          productName={ratingModal.productName}
          initialRating={ratingModal.initialRating}
        />

        <ShareModal 
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
          url={shareModal.url}
          title={shareModal.title}
        />

        <CommentModal
          isOpen={commentModal.isOpen}
          onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
          productId={commentModal.productId}
          productName={commentModal.productName}
        />

        {repostPopover.isOpen && (
          <RepostModal
            isOpen={repostPopover.isOpen}
            onClose={() => setRepostPopover({ isOpen: false, productId: null, position: { top: 0, left: 0 } })}
            position={repostPopover.position}
          />
        )}

        <ShopSearchModal 
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={shopsQuery}
        />

        <CreateUpdateModal 
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onCreated={() => {
            // Ideally we'd refresh the Feed or Stories here
            // but since stories are in a separate component, 
            // the Story creation modal handles local refreshes if needed.
            setIsUpdateModalOpen(false);
          }}
        />

        {/* Right Sidebar - Trending/Quick Links */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <aside className="fixed top-[128px] w-[320px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
            {/* Popular Shops */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Popular Shops</h3>
              <div className="space-y-1">
                {popularShops.length > 0 ? (
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
                          handleFollowToggle(vendor.id);
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
                  {/* Post Product Button */}
                  <button 
                    onClick={() => setShowProductModal(true)}
                    className="w-full text-left group block relative overflow-hidden rounded-2xl p-5 bg-primary shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Inventory</p>
                        <p className="text-xl font-black text-white leading-tight">POST PRODUCT</p>
                      </div>
                      <Plus className="w-8 h-8 text-white/40 group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  </button>

                  {/* Add Update Button */}
                  <button 
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="w-full text-left group block relative overflow-hidden rounded-2xl p-5 bg-secondary shadow-xl shadow-secondary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Stories</p>
                        <p className="text-xl font-black text-white leading-tight">ADD UPDATE</p>
                      </div>
                      <Send className="w-8 h-8 text-white/40 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-500" />
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Flash Deals */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Flash Deals</h3>
              <div className="space-y-4 px-2">
                {flashDealsData ? flashDealsData.map((product: any, i: number) => (
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
      </div>

      {/* Floating Action Button for Sellers */}
      {isSeller && (
        <button
          onClick={() => setShowProductModal(true)}
          className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 transition-all duration-300 transform ${
            showFab ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all group flex items-center gap-2">
            <Plus className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black text-sm whitespace-nowrap">
              POST PRODUCT
            </span>
          </div>
        </button>
      )}

      <ProductCreateModal 
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onCreated={() => {
          setShowProductModal(false);
          // Invalidate multiple possible product queries to ensure the feed/shop updates
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
          queryClient.invalidateQueries({ queryKey: ["product-feed"] });
          queryClient.invalidateQueries({ queryKey: ["my-products"] });
        }}
        shopName={myShop?.name}
      />
      
      <CreateUpdateModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading Shop...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;
