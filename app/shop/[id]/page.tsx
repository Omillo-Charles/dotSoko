"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Users,
  Info,
  ChevronLeft,
  ShoppingBag,
  Star,
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  Filter,
  LayoutGrid,
  TrendingUp,
  ShoppingCart,
  Send
} from "lucide-react";
import Link from "next/link";
import { GoldCheck } from "@/components/GoldCheck";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { useShop, useShopProducts, usePopularShops, useFollowShop, useShopLists, useMyShop, useShopReviews } from "@/hooks/useShop";
import { useUser } from "@/hooks/useUser";
import RatingModal from "@/components/RatingModal";
import ShopRatingModal from "@/components/ShopRatingModal";
import ShareShopModal from "@/components/ShareShopModal";
import ShareModal from "@/components/ShareModal";
import CommentModal from "@/components/CommentModal";
import { RepostModal } from "@/components/RepostModal";
import { ImageCarousel } from "@/components/ImageCarousel";

const ShopProfilePage = () => {
  const params = useParams();
  const idOrHandle = decodeURIComponent(params.id as string);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user: currentUser, refreshUser } = useUser();
  const { data: myShop } = useMyShop();
  
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: "",
    title: ""
  });

  const [shareShopModal, setShareShopModal] = useState({
    isOpen: false,
    url: "",
    shopName: ""
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



  const [repostPopover, setRepostPopover] = useState<{
    isOpen: boolean;
    productId: string | null;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    productId: null,
    position: { top: 0, left: 0 },
  });

  const [activeSection, setActiveSection] = useState('Products');
  const [isMounted, setIsMounted] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [debouncedPriceRange, setDebouncedPriceRange] = useState({ min: '', max: '' });

  // Debounce price range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

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

  const [shopRatingModal, setShopRatingModal] = useState({
    isOpen: false,
    shopId: "",
    shopName: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: shop, isLoading: isShopLoading, error: shopError } = useShop(idOrHandle);
  const { data: productsData = [], isLoading: isProductsLoading, refetch: refetchProducts } = useShopProducts(idOrHandle, {
    minPrice: debouncedPriceRange.min ? parseFloat(debouncedPriceRange.min) : undefined,
    maxPrice: debouncedPriceRange.max ? parseFloat(debouncedPriceRange.max) : undefined
  });
  const { data: popularShopsData = [] } = usePopularShops(4);
  const { data: listData = [], isLoading: isListsLoading } = useShopLists(idOrHandle, activeSection as 'Followers' | 'Following');
  const { data: reviewsData = [], isLoading: isReviewsLoading } = useShopReviews(idOrHandle);
  const followMutation = useFollowShop();

  const handleRepostClick = (productName: string) => {
    setRepostPopover({ isOpen: true, productId: null, position: { top: 0, left: 0 } });
  };

  useEffect(() => {
    if (shop && !idOrHandle.startsWith('@') && shop.username) {
      router.replace(`/shop/@${shop.username}`);
    }
  }, [shop, idOrHandle, router]);

  const products = React.useMemo(() => {
    return (productsData || []).map((p: any) => ({
      ...p,
      _id: String(p._id || p.id || `product-${Math.random()}`),
      name: String(p.name || "Untitled Product"),
      price: Number(p.price || 0),
      description: String(p.description || ""),
      image: p.image || p.images?.[0] || null,
      likesCount: Number(p.likesCount || p.likes?.length || 0),
      commentsCount: Number(p.commentsCount || p.comments?.length || 0),
      repostsCount: Number(p.repostsCount || 0),
      rating: Number(p.rating || 0),
      reviewsCount: Number(p.reviewsCount || 0)
    }));
  }, [productsData]);

  const isFollowing = (shop as any)?.isFollowing ?? false;
  
  const popularShops = React.useMemo(() => {
    return (popularShopsData || []).map((s: any) => ({
      id: String(s._id || s.id || `shop-${Math.random()}`),
      name: String(s.name || "Unknown Shop"),
      handle: s.username ? `@${s.username}` : `@${String(s.name || "shop").toLowerCase().replace(/\s+/g, "_")}`,
      avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name || "shop"}`,
      followers: Number(s.followersCount || s.followers?.length || 0),
      verified: Boolean(s.isVerified || false)
    }));
  }, [popularShopsData]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to follow shops");
      router.push("/auth?mode=login");
      return;
    }

    if (shop?.owner === currentUser?._id) {
      toast.error("You cannot follow your own shop");
      return;
    }

    try {
      await followMutation.mutateAsync(shop?._id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle follow");
    }
  };

  const isLoading = isShopLoading;
  const error = shopError ? (shopError as any).friendlyMessage || (shopError as any).response?.data?.message || "Failed to load shop" : null;

  // Use the actual products length if productsCount is missing
  const productsCount = shop?.productsCount || shop?.products?.length || products.length || 0;


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Info className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Oops!</h1>
        <p className="text-muted-foreground font-medium mb-8 text-center max-w-md">
          {error || "We couldn't find the shop you're looking for."}
        </p>
        <button 
          onClick={() => router.push("/shop")}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px]">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block w-[280px] shrink-0">
          <aside className="fixed top-[128px] w-[280px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
            <button 
              onClick={() => router.push('/shop')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group w-full"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Explore
            </button>

            <div className="space-y-4 pt-4">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Store Sections</h3>
              <div className="space-y-1">
                {[
                  { name: 'Products', icon: <ShoppingBag className="w-5 h-5" />, count: products.length },
                  { name: 'Reviews', icon: <Star className="w-5 h-5" />, count: shop?.reviewsCount || reviewsData.length },
                  { name: 'About', icon: <Info className="w-5 h-5" /> },
                  { name: 'Followers', icon: <Users className="w-5 h-5" />, count: shop?.followersCount ?? shop?.followers?.length },
                  { name: 'Following', icon: <Users className="w-5 h-5" />, count: shop?.followingCount ?? shop?.following?.length },
                ].map((item) => (
                  <button 
                    key={item.name}
                    onClick={() => setActiveSection(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeSection === item.name ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        activeSection === item.name ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

       {/* Middle Feed - Products */}
        <main className="flex-1 min-w-0 border-x border-border pb-24 lg:pb-0">
          {/* Header - Profile Style */}
          <div className="sticky top-[80px] md:top-[128px] bg-background/80 backdrop-blur-md z-30 border-b border-border px-4 py-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="lg:hidden p-2 hover:bg-muted rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-foreground leading-none">{shop.name}</h1>
              <p className="text-xs font-bold text-muted-foreground mt-1">{products.length} products</p>
            </div>
          </div>

          {/* Banner & Profile Info */}
          <div className="relative">
            <div className="h-48 bg-muted relative overflow-hidden">
              {shop.banner && <img src={shop.banner} alt="Banner" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>
            
            <div className="px-4 pb-6">
              <div className="relative flex justify-between items-end -mt-16 mb-4">
                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-background dark:border-slate-900 overflow-hidden bg-muted dark:bg-slate-800 shadow-xl">
                  <img 
                    src={shop.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`} 
                    alt={shop.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex gap-2 pb-2">
                  {!isMounted ? (
                    <button 
                      className="px-6 py-2 rounded-full text-sm font-black transition-all bg-foreground dark:bg-white text-background dark:text-slate-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white"
                    >
                      Follow
                    </button>
                  ) : (
                    <>
                      {currentUser && (!myShop || String(myShop._id || myShop.id) !== String(shop?._id)) && shop?.owner !== currentUser?._id && (
                        <button 
                          onClick={handleFollowToggle}
                          disabled={followMutation.isPending}
                          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
                            isFollowing 
                              ? 'bg-muted dark:bg-white/5 text-foreground dark:text-white hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 hover:border-red-100' 
                              : 'bg-foreground dark:bg-white text-background dark:text-slate-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white'
                          } ${followMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {followMutation.isPending ? '...' : (isFollowing ? 'Following' : 'Follow')}
                        </button>
                      )}
                      {!currentUser && (
                        <button 
                          onClick={handleFollowToggle}
                          className="px-6 py-2 rounded-full text-sm font-black transition-all bg-foreground dark:bg-white text-background dark:text-slate-900 hover:bg-primary dark:hover:bg-primary dark:hover:text-white"
                        >
                          Follow
                        </button>
                      )}
                    </>
                  )}
                  <button 
                    onClick={() => setShareShopModal({
                      isOpen: true,
                      url: typeof window !== 'undefined' ? window.location.href : '',
                      shopName: shop.name
                    })}
                    className="p-2 border border-border rounded-full hover:bg-muted transition-all"
                  >
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => setShopRatingModal({
                      isOpen: true,
                      shopId: shop?._id,
                      shopName: shop.name
                    })}
                    className="p-2 border border-border rounded-full hover:bg-muted transition-all"
                  >
                    <Star className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-0.5">
                  <h2 className="text-xl font-black text-foreground dark:text-white">{shop.name}</h2>
                  {shop.isVerified && <GoldCheck className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-muted-foreground">{shop.username ? `@${shop.username}` : `@${shop.name.toLowerCase().replace(/\s+/g, "_")}`}</p>
                  <div className="w-1 h-1 rounded-full bg-border dark:bg-white/10" />
                  <button 
                    onClick={() => setActiveSection('Followers')}
                    className="text-sm font-bold text-foreground dark:text-white hover:underline"
                  >
                    {shop?.followersCount ?? shop?.followers?.length ?? 0} <span className="text-muted-foreground">Followers</span>
                  </button>
                  <div className="w-1 h-1 rounded-full bg-border dark:bg-white/10" />
                  <button 
                    onClick={() => setActiveSection('Following')}
                    className="text-sm font-bold text-foreground dark:text-white hover:underline"
                  >
                    {shop?.followingCount ?? shop?.following?.length ?? 0} <span className="text-muted-foreground">Following</span>
                  </button>
                  <div className="w-1 h-1 rounded-full bg-border dark:bg-white/10" />
                  <button 
                    onClick={() => setActiveSection('Products')}
                    className="text-sm font-bold text-foreground dark:text-white hover:underline"
                  >
                    {productsCount} <span className="text-muted-foreground">Products</span>
                  </button>
                </div>
              </div>

              <p className="mt-4 text-[13px] text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {shop.description}
              </p>
            </div>
          </div>

          {/* Main Feed Content */}
          <div className="border-t border-border">
            {activeSection === 'Products' ? (
              products.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4 text-center">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <div>
                    <p className="font-black text-foreground">No products found</p>
                    <p className="text-sm">This shop hasn't posted any products yet.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {products.map((product: any) => (
                    <div 
                      key={product._id} 
                      onClick={() => router.push(`/shop/product/${product._id}`)}
                      className="p-4 md:p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3 md:gap-4">
                        {/* Profile Image (Small in feed) */}
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted">
                            <img 
                              src={shop.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shop.name}`} 
                              alt={shop.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-sm font-black text-foreground dark:text-white truncate flex items-center gap-0.5">
                                {shop.name}
                                {shop.isVerified && <GoldCheck className="w-3.5 h-3.5" />}
                              </span>
                              <span className="text-muted-foreground text-xs truncate">{shop.username ? `@${shop.username}` : `@${shop.name.toLowerCase().replace(/\s+/g, "_")}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setRatingModal({
                                    isOpen: true,
                                    productId: product._id,
                                    productName: product.name,
                                    initialRating: product.rating
                                  });
                                }}
                                className="text-muted-foreground/30 hover:text-amber-500 p-1.5 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                                title="Rate Product"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-foreground dark:text-slate-300 text-[13px] leading-relaxed mb-3 whitespace-pre-wrap">
                            {product.description}
                          </p>

                          {(product.images?.length > 0 || product.image) && (
                            <div className="rounded-[1.25rem] overflow-hidden border border-border mb-3 bg-muted relative aspect-square group/img flex items-center justify-center">
                              <ImageCarousel 
                                images={product.images?.length > 0 ? product.images : [product.image]} 
                                alt={product.name} 
                              />
                              <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-xl shadow-foreground/5 flex flex-col items-end">
                                <span className="text-primary font-black text-sm">KES {product.price?.toLocaleString()}</span>
                                {product.rating > 0 && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    <span className="text-[10px] font-black text-amber-600">{product.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between max-w-md text-muted-foreground -ml-2">
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setCommentModal({
                                isOpen: true,
                                productId: product._id,
                                productName: product.name
                              });
                            }} className="flex items-center gap-0 group hover:text-primary transition-colors">
                              <div className="p-2 rounded-full group-hover:bg-primary/10">
                                <MessageCircle className="w-[18px] h-[18px]" />
                              </div>
                              <span className="text-xs font-bold">{product.commentsCount || 0}</span>
                            </button>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setRepostPopover({
                                isOpen: repostPopover.productId !== product._id,
                                productId: product._id,
                                position: {
                                  top: rect.bottom + window.scrollY + 5,
                                  left: rect.right + window.scrollX - 140,
                                },
                              });
                            }} className="flex items-center gap-0 group hover:text-green-500 transition-colors">
                              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                                <Repeat2 className="w-[18px] h-[18px]" />
                              </div>
                              <span className="text-xs font-bold">{product.repostsCount || 0}</span>
                            </button>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                await toggleWishlist(product._id);
                              }} 
                              className={`flex items-center gap-0 group transition-colors ${
                                isInWishlist(product._id) ? 'text-pink-500' : 'hover:text-pink-500'
                              }`}
                            >
                              <div className={`p-2 rounded-full transition-colors ${
                                isInWishlist(product._id) ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'
                              }`}>
                                <Heart className={`w-[18px] h-[18px] ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                              </div>
                              <span className="text-xs font-bold">{product.likesCount || 0}</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (product.sizes?.length > 0 || product.colors?.length > 0) {
                                  router.push(`/shop/product/${product._id}`);
                                } else {
                                  addToCart(product._id);
                                }
                              }} 
                              className="flex items-center gap-0 group hover:text-primary transition-colors"
                            >
                              <div className="p-2 rounded-full group-hover:bg-primary/10">
                                <ShoppingCart className="w-[18px] h-[18px]" />
                              </div>
                              <span className="text-xs font-bold">Add to Cart</span>
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                const productUrl = `${window.location.origin}/shop/product/${product._id}`;
                                setShareModal({
                                  isOpen: true,
                                  url: productUrl,
                                  title: product.name
                                });
                              }}
                              className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Share2 className="w-[18px] h-[18px]" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                // Placeholder for future functionality
                              }}
                              className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Send className="w-[18px] h-[18px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeSection === 'Reviews' ? (
              <div className="flex flex-col min-h-[400px]">
                {isReviewsLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-sm">Loading reviews...</p>
                  </div>
                ) : reviewsData.length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-6 text-center">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                      <Star className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black text-xl text-foreground">No reviews yet</p>
                      <p className="text-sm max-w-[280px] mx-auto">Customers haven't left any reviews for this shop yet. Be the first to share your experience!</p>
                    </div>
                    {currentUser && shop?.owner !== currentUser?._id && (
                      <button 
                        onClick={() => setShopRatingModal({
                            isOpen: true,
                            shopId: shop?._id,
                            shopName: shop.name
                          })}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                      >
                        Rate this Shop
                      </button>
                    )}
                    {!currentUser && (
                      <button 
                        onClick={() => router.push("/auth?mode=login")}
                        className="px-8 py-3 bg-foreground text-background rounded-full font-black shadow-lg hover:scale-105 transition-all active:scale-95"
                      >
                        Login to Rate
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {/* Review Stats Header */}
                    <div className="p-6 bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-black text-foreground">{(shop?.rating || 0).toFixed(1)}</div>
                        <div>
                          <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={`w-3.5 h-3.5 ${ (shop?.rating || 0) >= i ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`} />
                            ))}
                          </div>
                          <p className="text-xs font-bold text-muted-foreground">Based on {shop?.reviewsCount || reviewsData.length} reviews</p>
                        </div>
                      </div>
                      {currentUser && shop?.owner !== currentUser?._id && (
                        <button 
                          onClick={() => setShopRatingModal({
                            isOpen: true,
                            shopId: shop?._id,
                            shopName: shop.name
                          })}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>

                    {/* Reviews List */}
                    <div className="divide-y divide-border">
                      {reviewsData.map((review: any) => (
                        <div key={review._id} className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                                <img 
                                  src={review.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name || 'user'}`} 
                                  alt={review.user?.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-black text-foreground">{review.user?.name}</p>
                                <p className="text-xs font-bold text-muted-foreground/60">
                                  {review.user?.username ? `@${review.user.username}` : 'Customer'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-0.5 mb-1 justify-end">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <Star key={i} className={`w-3 h-3 ${ review.rating >= i ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`} />
                                ))}
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          
                          {review.comment && (
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/50">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeSection === 'Followers' ? (
              <div className="divide-y divide-border">
                {isListsLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-sm">Loading followers...</p>
                  </div>
                ) : listData.length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4 text-center">
                    <Users className="w-12 h-12 opacity-20" />
                    <div>
                      <p className="font-black text-foreground">No followers yet</p>
                      <p className="text-sm">This shop doesn't have any followers yet.</p>
                    </div>
                  </div>
                ) : (
                  (listData || []).map((follower: any) => (
                    <div key={follower._id || follower.id || Math.random()} className="p-4 md:p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                          <img 
                            src={follower.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.name || 'user'}`} 
                            alt={follower.name || 'User'} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground leading-none mb-1">{follower.name}</p>
                          <p className="text-xs font-bold text-muted-foreground/60">{follower.username ? `@${follower.username}` : `@${(follower.name || 'user').toLowerCase().replace(/\s+/g, "_")}`}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeSection === 'Following' ? (
              <div className="divide-y divide-border">
                {isListsLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-sm">Loading following...</p>
                  </div>
                ) : (listData || []).length === 0 ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground gap-4 text-center">
                    <Users className="w-12 h-12 opacity-20" />
                    <div>
                      <p className="font-black text-foreground">Not following anyone</p>
                      <p className="text-sm">This shop isn't following anyone yet.</p>
                    </div>
                  </div>
                ) : (
                  (listData || []).map((followedShop: any) => (
                    <div 
                      key={followedShop._id || followedShop.id || Math.random()} 
                      onClick={() => {
                        const shopIdOrHandle = followedShop.username ? `@${followedShop.username}` : (followedShop._id || followedShop.id);
                        if (shopIdOrHandle) router.push(`/shop/${shopIdOrHandle}`);
                      }}
                      className="p-4 md:p-6 flex items-center justify-between gap-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                          <img 
                            src={followedShop.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${followedShop.name || 'shop'}`} 
                            alt={followedShop.name || 'Shop'} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-0.5">
                            <p className="font-black text-foreground text-sm">{followedShop.name || 'Unknown Shop'}</p>
                            {followedShop.isVerified && <GoldCheck className="w-3 h-3" />}
                          </div>
                          <p className="text-xs font-bold text-muted-foreground/60">{followedShop.username ? `@${followedShop.username}` : `@${(followedShop.name || 'shop').toLowerCase().replace(/\s+/g, "_")}`}</p>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 bg-muted text-foreground rounded-full text-xs font-black hover:bg-muted/80 transition-all">
                        View Shop
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-8 md:p-12 space-y-8">
                <div>
                  <h3 className="text-lg font-black text-foreground mb-4">About {shop.name}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {shop.description || "No description provided."}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Contact Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                        <Phone className="w-4 h-4 text-primary" />
                        {shop.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                        <Mail className="w-4 h-4 text-primary" />
                        {shop.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                        <MapPin className="w-4 h-4 text-primary" />
                        {shop.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Store Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="text-foreground">{new Date(shop.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-muted-foreground">Total Products</span>
                        <span className="text-foreground">{products.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-muted-foreground">Verified</span>
                        <span className={shop.isVerified ? "text-green-600" : "text-muted-foreground/60"}>
                          {shop.isVerified ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
          onRatingUpdate={() => {
            // Refresh shop data or products
            window.location.reload();
          }}
        />

        <ShareModal 
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
          url={shareModal.url}
          title={shareModal.title}
        />

        <ShareShopModal 
          isOpen={shareShopModal.isOpen}
          onClose={() => setShareShopModal(prev => ({ ...prev, isOpen: false }))}
          url={shareShopModal.url}
          shopName={shareShopModal.shopName}
        />

        <CommentModal
          isOpen={commentModal.isOpen}
          onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
          productId={commentModal.productId}
          productName={commentModal.productName}
          onCommentAdded={refetchProducts}
        />

        <ShopRatingModal
          isOpen={shopRatingModal.isOpen}
          onClose={() => setShopRatingModal(prev => ({ ...prev, isOpen: false }))}
          shopId={shopRatingModal.shopId}
          shopName={shopRatingModal.shopName}
        />

        {repostPopover.isOpen && (
          <RepostModal
            isOpen={repostPopover.isOpen}
            onClose={() => setRepostPopover({ isOpen: false, productId: null, position: { top: 0, left: 0 } })}
            position={repostPopover.position}
          />
        )}

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <aside className="fixed top-[128px] w-[320px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
            {/* Store Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
                <p className="text-lg font-black text-foreground">
                  {(shop?.rating || 0).toFixed(1)}
                </p>
                <button 
                  onClick={() => setShopRatingModal({
                      isOpen: true,
                      shopId: shop?._id,
                      shopName: shop.name
                    })}
                  className="flex justify-center gap-0.5 my-1 hover:scale-110 transition-transform cursor-pointer mx-auto"
                >
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i} 
                      className={`w-2.5 h-2.5 ${
                        (shop?.rating || 0) >= i 
                          ? "text-amber-500 fill-amber-500" 
                          : "text-muted-foreground/20"
                      }`} 
                    />
                  ))}
                </button>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rating</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl border border-border text-center">
                <p className="text-lg font-black text-foreground">{shop?.followersCount ?? shop?.followers?.length ?? 0}</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-2">Followers</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Filters</h3>
              <div className="bg-muted/50 rounded-2xl border border-border p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">Price Range</p>
                    {(priceRange.min || priceRange.max) && (
                      <button 
                        onClick={() => setPriceRange({ min: '', max: '' })}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">KES</span>
                      <input 
                        type="number" 
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        placeholder="Min" 
                        className="w-full bg-background border border-border rounded-xl py-2 pl-8 pr-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/30 transition-all" 
                      />
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">KES</span>
                      <input 
                        type="number" 
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        placeholder="Max" 
                        className="w-full bg-background border border-border rounded-xl py-2 pl-8 pr-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/30 transition-all" 
                      />
                    </div>
                  </div>
                  {(priceRange.min || priceRange.max) && (
                    <p className="text-[10px] font-medium text-muted-foreground px-1 italic">
                      Showing products between {priceRange.min || '0'} and {priceRange.max || '∞'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Information</h3>
              <div className="bg-muted/50 rounded-2xl border border-border p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight mb-0.5">Location</p>
                    <p className="text-xs font-bold text-foreground dark:text-slate-300 leading-snug">{shop.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight mb-0.5">Phone</p>
                    <p className="text-xs font-bold text-foreground dark:text-slate-300">{shop.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight mb-0.5">Email</p>
                    <p className="text-xs font-bold text-foreground dark:text-slate-300 truncate">{shop.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Stores */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Popular Stores</h3>
              <div className="space-y-1">
                {popularShops
                  .filter((s: any) => s.id !== shop?._id) // Filter out the current shop
                  .slice(0, 4) // Limit to 4 shops
                  .map((vendor: any) => (
                  <div 
                    key={vendor.id} 
                    onClick={() => router.push(`/shop/${vendor.handle || vendor.id}`)}
                    className="p-3 hover:bg-muted dark:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between gap-3 rounded-xl group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 aspect-square rounded-full overflow-hidden bg-muted dark:bg-slate-800 border border-border shrink-0">
                        <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-0.5">
                          <p className="font-bold text-foreground dark:text-white text-sm truncate">{vendor.name}</p>
                          {vendor.verified && <GoldCheck className="w-3 h-3" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground text-[11px] truncate">{vendor.handle}</p>
                          <span className="text-muted-foreground/30">·</span>
                          <p className="text-muted-foreground text-[11px] font-bold">{vendor.followers} followers</p>
                        </div>
                      </div>
                    </div>
                    <button className="bg-foreground dark:bg-white text-background dark:text-slate-900 text-[11px] font-black px-4 py-1.5 rounded-full hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shrink-0">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ShopProfilePage;
