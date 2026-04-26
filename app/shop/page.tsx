"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Info,
  Plus,
  Repeat2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

import { useProducts, useLimitedProducts, usePersonalizedFeed, useTrackActivity, useInfiniteProducts, useInfinitePersonalizedFeed } from "@/hooks/useProducts";
import { usePopularShops, useFollowShop, useMyShop } from "@/hooks/useShop";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import FeedbackModal from "@/components/modals/FeedbackModal";
import { UniversalShareModal } from "@/components/modals/UniversalShareModal";
import CommentModal from "@/components/modals/CommentModal";
import ShopSearchModal from "@/components/modals/ShopSearchModal";
import ChoiceModal from "@/components/modals/ChoiceModal";
import ProductCreateModal from "@/components/modals/ProductCreateModal";

import { ShopLeftSidebar } from "@/components/shop/ShopLeftSidebar";
import { ShopRightSidebar } from "@/components/shop/ShopRightSidebar";
import { ProductFeedCard } from "@/components/shop/ProductFeedCard";

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
  const { data: flashDealsData, isLoading: isFlashDealsLoading } = useLimitedProducts(3);
  const followMutation = useFollowShop();

  const [isMounted, setIsMounted] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [debouncedPriceRange, setDebouncedPriceRange] = useState({ min: '', max: '' });

  const { data: feedProducts, isLoading: isFeedLoading } = usePersonalizedFeed(24);

  // Modal states
  const [ratingModal, setRatingModal] = useState({ isOpen: false, productId: "", productName: "", initialRating: 0 });
  const [commentModal, setCommentModal] = useState({ isOpen: false, productId: "", productName: "" });
  const [shareModal, setShareModal] = useState({ isOpen: false, url: "", title: "" });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [repostPopover, setRepostPopover] = useState<{ isOpen: boolean; productId: string | null; position: { top: number; left: number } }>({ isOpen: false, productId: null, position: { top: 0, left: 0 } });
  const [showProductModal, setShowProductModal] = useState(false);
  const observerTarget = React.useRef(null);

  const [desktopSearchQuery, setDesktopSearchQuery] = useState(shopsQuery || "");
  const [showDesktopSuggestions, setShowDesktopSuggestions] = useState(false);

  // Debounce price range
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPriceRange(priceRange), 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Track category changes
  useEffect(() => {
    if (cat && cat !== 'all') trackActivity({ type: 'view', category: cat });
  }, [cat]);

  // Track searches
  useEffect(() => {
    if (query) trackActivity({ type: 'search', searchQuery: query });
  }, [query]);

  // Sync search with URL
  useEffect(() => { setDesktopSearchQuery(shopsQuery || ""); }, [shopsQuery]);
  useEffect(() => { setIsMounted(true); }, []);

  // Scroll-aware FAB
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowFab(!(currentScrollY > lastScrollY && currentScrollY > 100));
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Mobile check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isSeller = isMounted && (currentUser?.accountType === 'seller' || !!myShop);

  const infiniteProducts = useInfiniteProducts({
    q: query,
    cat: cat !== 'all' ? cat : undefined,
    following: activeTab === 'following' ? 'true' : undefined,
    minPrice: debouncedPriceRange.min ? parseFloat(debouncedPriceRange.min) : undefined,
    maxPrice: debouncedPriceRange.max ? parseFloat(debouncedPriceRange.max) : undefined,
  });

  const infiniteFeed = useInfinitePersonalizedFeed(24);

  const isFeedTab = activeTab === 'foryou' && !query && cat === 'all' && !debouncedPriceRange.min && !debouncedPriceRange.max;
  const currentQuery = isFeedTab ? infiniteFeed : infiniteProducts;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && currentQuery.hasNextPage && !currentQuery.isFetchingNextPage) {
          currentQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [currentQuery.hasNextPage, currentQuery.fetchNextPage, currentQuery.isFetchingNextPage]);

  const products = React.useMemo(() => {
    return currentQuery.data?.pages.flatMap((page: any) => page.data) || [];
  }, [currentQuery.data]);

  const isLoading = currentQuery.isLoading;
  const isFetchingNextPage = currentQuery.isFetchingNextPage;
  const error = currentQuery.error ? (currentQuery.error as any).response?.data?.message || "Failed to load products" : null;

  const displayProducts = React.useMemo(() => {
    if (activeTab === 'following' && myShop) {
      const myShopId = myShop._id || myShop.id;
      return products.filter((p: any) => String(p.shop?._id || p.shop?.id || p.shop) !== String(myShopId));
    }
    return products;
  }, [products, activeTab, myShop]);

  const popularShops = React.useMemo(() => {
    let shops = (popularShopsData || []).map((s: any) => ({
      id: s._id || s.id || `shop-${Math.random()}`,
      name: s.name || "Unknown Shop",
      handle: s.username ? `@${s.username}` : null,
      avatar: s.avatar || '/defaultAvatar.jpeg',
      followers: s.followersCount || s.followers?.length || 0,
      verified: s.isVerified || false,
      isFollowing: Boolean(s.isFollowing) || (Array.isArray(s.followersList) && currentUser && s.followersList.some((f: any) => String(f._id || f) === String(currentUser?._id))),
      products: s.productsCount || s.products?.length || 0,
    }));
    if (shopsQuery) {
      const q = shopsQuery.toLowerCase();
      shops = shops.filter((s: any) => s.name.toLowerCase().includes(q) || (s.handle && s.handle.toLowerCase().includes(q)));
    }
    return shops;
  }, [popularShopsData, shopsQuery, currentUser]);

  const desktopSuggestions = React.useMemo(() => {
    if (!desktopSearchQuery.trim()) return [];
    const q = desktopSearchQuery.toLowerCase();
    return popularShops.filter((s: any) => s.name.toLowerCase().includes(q) || (s.handle && s.handle.toLowerCase().includes(q))).slice(0, 5);
  }, [desktopSearchQuery, popularShops]);

  // Handlers
  const handleProductClick = (p: any) => {
    const id = p._id || p.id;
    if (id) { trackActivity({ type: 'click', productId: id, category: p.category }); router.push(`/shop/product/${id}`); }
  };

  const handleAddToCart = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    const id = p._id || p.id;
    if (id) { trackActivity({ type: "cart", productId: id, category: p.category }); addToCart(id); }
  };

  const handleWishlist = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    const id = p._id || p.id;
    if (id) { if (!isInWishlist(id)) trackActivity({ type: 'wishlist', productId: id, category: p.category }); toggleWishlist(id); }
  };

  const handleFollowToggle = async (shopId: string) => {
    if (!currentUser) { toast.error("Please login to follow shops"); router.push("/auth?mode=login"); return; }
    try { await followMutation.mutateAsync(shopId); } catch (err: any) { toast.error(err.response?.data?.message || "Failed to toggle follow"); }
  };

  const handleCategoryClick = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue === 'all') { params.delete('cat'); } else { params.set('cat', categoryValue); }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (desktopSearchQuery.trim()) { params.set('shops_q', desktopSearchQuery.trim()); } else { params.delete('shops_q'); }
    router.push(`/shop?${params.toString()}`);
    setShowDesktopSuggestions(false);
  };

  const handleRepostToggle = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRepostPopover({
      isOpen: repostPopover.productId !== productId,
      productId: productId,
      position: { top: rect.bottom + window.scrollY + 5, left: rect.right + window.scrollX - 100 },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px]">

        {/* Left Sidebar */}
        <ShopLeftSidebar
          currentCat={cat}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          desktopSearchQuery={desktopSearchQuery}
          setDesktopSearchQuery={setDesktopSearchQuery}
          showDesktopSuggestions={showDesktopSuggestions}
          setShowDesktopSuggestions={setShowDesktopSuggestions}
          desktopSuggestions={desktopSuggestions}
          onSearch={handleSearch}
          onCategoryClick={handleCategoryClick}
        />

        {/* Middle Feed */}
        <main className="flex-1 min-w-0 border-x border-border pb-24 lg:pb-0">
          {/* Feed Header */}
          <div className="sticky top-[80px] md:top-[128px] bg-background/80 backdrop-blur-md z-30 border-b border-border">
            <div className="px-4 py-2 md:py-4 flex items-center justify-between">
              <h1 className="text-xl font-black text-foreground">Explore</h1>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="lg:hidden p-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-2xl transition-all active:scale-95"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <div className="flex">
              {[{ id: 'foryou', label: 'For You' }, { id: 'following', label: 'Following' }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'foryou' | 'following')}
                  className="flex-1 hover:bg-muted/50 transition-colors relative h-14 flex items-center justify-center group"
                >
                  <span className={`text-sm font-bold ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}>{tab.label}</span>
                  {activeTab === tab.id && <div className="absolute bottom-0 h-1 w-16 bg-primary rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Seller Hub */}
          {isSeller && (
            <div className="lg:hidden border-b border-border bg-muted/20 px-4 py-4 space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Seller Hub</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowProductModal(true)} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-primary/10 active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />POST PRODUCT
                </button>
              </div>
            </div>
          )}

          {/* Product Feed */}
          <div>
            {/* Mobile shop search results */}
            {shopsQuery && (
              <div className="lg:hidden border-b border-border bg-muted/30">
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shop Results</h3>
                  <button
                    onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete('shops_q'); router.push(`/shop?${p.toString()}`); }}
                    className="text-[10px] font-bold text-primary"
                  >Clear</button>
                </div>
                <div className="flex overflow-x-auto pb-4 px-4 gap-3 no-scrollbar">
                  {popularShops.length > 0 ? popularShops.map((vendor: any) => (
                    <div key={vendor.id} onClick={() => router.push(`/shop/${vendor.handle || vendor.id}`)} className="shrink-0 w-[200px] p-4 bg-background border border-border rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                          <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-foreground truncate">{vendor.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground truncate">{vendor.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-bold text-muted-foreground">{vendor.followers} followers</div>
                        {isMounted && (!myShop || String(myShop._id || myShop.id) !== String(vendor.id)) && (
                          <button onClick={(e) => { e.stopPropagation(); handleFollowToggle(vendor.id); }} className={`px-3 py-1 rounded-full text-[10px] font-black ${vendor.isFollowing ? 'bg-muted text-foreground' : 'bg-foreground text-background'}`}>
                            {vendor.isFollowing ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="w-full py-8 text-center bg-background rounded-2xl border border-border border-dashed">
                      <p className="text-xs font-bold text-muted-foreground">No shops found for "{shopsQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading / Error / Empty / Feed states */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 px-4 py-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse overflow-hidden">
                    <div className="h-2/3 bg-muted-foreground/10" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted-foreground/10 rounded-full w-3/4" />
                      <div className="h-3 bg-muted-foreground/10 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-20 flex flex-col items-center justify-center text-destructive gap-4">
                <Info className="w-10 h-10" />
                <p className="font-bold text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-muted text-muted-foreground rounded-full text-xs font-bold hover:bg-muted/80 transition-colors">Try Again</button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-6 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mb-2">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <div className="space-y-2 max-w-xs">
                  <p className="font-black text-foreground text-lg uppercase tracking-tight">
                    {isMounted && activeTab === 'following' && !currentUser ? "Login Required" : query ? "No product found" : "No products yet"}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {isMounted && activeTab === 'following' && !currentUser
                      ? "Sign in to your account to view updates from your favorite shops."
                      : query ? `We couldn't find any matches for "${query}" across our categories.`
                      : "Be the first to post something amazing in this category!"}
                  </p>
                </div>
                {isMounted && activeTab === 'following' && !currentUser ? (
                  <Link href="/auth?mode=login" className="mt-2 px-8 py-3.5 bg-foreground text-background rounded-2xl text-sm font-bold shadow-xl shadow-foreground/10 hover:bg-primary transition-all">Login Now</Link>
                ) : query ? (
                  <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete('q'); router.push(`/shop?${p.toString()}`); }} className="mt-2 px-8 py-3.5 bg-muted text-muted-foreground rounded-2xl text-sm font-bold hover:bg-muted/80 transition-all">Clear Search</button>
                ) : (
                  <Link href="/account/seller/products?action=add" className="mt-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">Post a Product</Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border bg-background">
                {displayProducts.map((product: any) => (
                  <ProductFeedCard
                    key={product._id || product.id}
                    product={product}
                    isInWishlist={isInWishlist}
                    repostPopover={repostPopover}
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    onWishlist={handleWishlist}
                    onRatingOpen={(productId, productName, initialRating) => setRatingModal({ isOpen: true, productId, productName, initialRating })}
                    onCommentOpen={(productId, productName) => setCommentModal({ isOpen: true, productId, productName })}
                    onRepostToggle={handleRepostToggle}
                    onShareOpen={(url, title) => setShareModal({ isOpen: true, url, title })}
                  />
                ))}
                
                {/* Intersection Observer Sentinel */}
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Loading more...</p>
                    </div>
                  )}
                  {!currentQuery.hasNextPage && products.length > 0 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">You've reached the end</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        <FeedbackModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
          id={ratingModal.productId}
          name={ratingModal.productName}
          type="product"
        />
        <UniversalShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
          url={shareModal.url}
          title={shareModal.title}
          type="product"
        />
        <CommentModal
          isOpen={commentModal.isOpen}
          onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
          productId={commentModal.productId}
          productName={commentModal.productName}
        />
        {repostPopover.isOpen && (
          <ChoiceModal
            isOpen={repostPopover.isOpen}
            onClose={() => setRepostPopover({ isOpen: false, productId: null, position: { top: 0, left: 0 } })}
            layout="popover"
            position={repostPopover.position}
            items={[
              { id: "repost", label: "Repost", icon: Repeat2, onClick: () => toast.success("Reposted to your feed") },
              { id: "resell", label: "Resell", icon: ShoppingCart, onClick: () => toast.success("Added to your resell list") },
            ]}
          />
        )}
        <ShopSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} initialQuery={shopsQuery} />

        {/* Right Sidebar */}
        <ShopRightSidebar
          popularShops={popularShops}
          flashDeals={flashDealsData || []}
          isSeller={isSeller}
          isMounted={isMounted}
          myShop={myShop}
          currentUser={currentUser}
          followMutation={followMutation}
          shopsQuery={shopsQuery}
          isLoading={isShopsLoading}
          onPostProduct={() => setShowProductModal(true)}
          onFollowToggle={handleFollowToggle}
        />
      </div>

      {/* Floating Action Button */}
      {isSeller && (
        <button
          onClick={() => setShowProductModal(true)}
          className={`hidden md:flex fixed md:bottom-8 md:right-8 z-40 transition-all duration-300 transform ${showFab ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
          <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all group flex items-center gap-2">
            <Plus className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black text-sm whitespace-nowrap">POST PRODUCT</span>
          </div>
        </button>
      )}

      <ProductCreateModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onCreated={() => {
          setShowProductModal(false);
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
          queryClient.invalidateQueries({ queryKey: ["product-feed"] });
          queryClient.invalidateQueries({ queryKey: ["my-products"] });
        }}
        shopName={myShop?.name}
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
