"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus,
  Info, 
  Trash2, 
  MessageSquare as MessageIcon,
  ShoppingBag,
  TrendingUp,
  LayoutGrid,
  Filter,
  Search,
  ArrowRight,
  Repeat2
} from "lucide-react";
import Link from "next/link";
import { GoldCheck, ProductRating } from "@/components/ui/CommonUI";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useUser } from "@/hooks/useUser";
import { useComments } from "@/hooks/useComments";
import { usePopularShops, useFollowShop, useMyShop } from "@/hooks/useShop";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { categories as allCategories } from "@/constants/categories";
import { UniversalShareModal } from "@/components/modals/UniversalShareModal";
import CommentModal from "@/components/modals/CommentModal";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user: currentUser } = useUser();
  const { data: myShop } = useMyShop();
  const { data: popularShopsData } = usePopularShops(4);
  const followMutation = useFollowShop();
  
  const { data: product, isLoading, error } = useProduct(id as string);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { comments, isLoading: isCommentsLoading, deleteComment } = useComments(id as string);
  const { data: productsData, isLoading: isProductsLoading } = useProducts(
     product?.category ? { cat: product.category, limit: 11 } : { limit: 11 }
   );

  const recommendedProducts = React.useMemo(() => {
    if (!productsData || !product) return [];
    return productsData
      .filter((p: any) => p._id !== product._id)
      .slice(0, 10);
  }, [productsData, product]);

  const productImages = React.useMemo(() => {
    if (!product) return [];
    
    let media: string[] = [];
    
    if (product.variantOptions && product.variantOptions.length > 0) {
      media = [...media, ...product.variantOptions.map((v: any) => v.image)];
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      media = [...media, ...product.images];
    } else if (product.image) {
      media = [...media, product.image];
    }
    
    return media;
  }, [product]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const popularShops = React.useMemo(() => {
    return (popularShopsData || []).map((s: any) => {
      const isFollowing = Boolean(s.isFollowing) || (Array.isArray(s.followersList) && currentUser && s.followersList.some((f: any) => String(f._id || f) === String(currentUser?._id)));
      
      return {
        id: String(s._id || s.id || `shop-${Math.random()}`),
        name: String(s.name || "Unknown Shop"),
        handle: s.username ? `@${s.username}` : `@${String(s.name || "shop").toLowerCase().replace(/\s+/g, "_")}`,
        avatar: s.avatar || '/defaultAvatar.jpeg',
        followersCount: Number(s.followersCount || s.followers?.length || 0),
        verified: Boolean(s.isVerified || false),
        isFollowing: isFollowing,
        products: Number(s.productsCount || s.products?.length || 0)
      };
    });
  }, [popularShopsData, currentUser]);

  const handleFollowToggle = async (shopId: string) => {
    if (!currentUser) {
      router.push("/auth?mode=login");
      return;
    }
    try {
      await followMutation.mutateAsync(shopId);
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product._id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Info className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Oops!</h1>
        <p className="text-muted-foreground font-medium mb-8 text-center max-w-md">
          {error instanceof Error ? error.message : (error || "Product not found")}
        </p>
        <button onClick={() => router.push("/shop")} className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold">Back to Shop</button>
      </div>
    );
  }

  const categories = allCategories.filter(c => c.value !== 'all');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px]">
        
        {/* Left Sidebar - Categories */}
        <div className="hidden lg:block w-[280px] shrink-0">
          <aside className="fixed top-[128px] w-[280px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
            <button 
              onClick={() => router.push('/shop')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group w-full"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Explore
            </button>

            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = (category as any).icon;
                  return (
                    <Link 
                      key={category.value}
                      href={`/shop?cat=${category.value}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                      </div>
                      {category.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        {/* Middle Feed - Product Detail */}
        <main className="flex-1 min-w-0 border-x border-border pb-24 lg:pb-0">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-[80px] bg-background/80 backdrop-blur-md z-30 border-b border-border px-4 py-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-foreground truncate">{product.name}</h1>
          </div>

          <div className="p-4 md:p-8 space-y-12">
            {/* Main Product Info Card */}
            <div className="bg-background rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
              <div className="flex flex-col">
                {/* 1. Shop Name Header */}
                <div className="p-5 md:px-8 md:pt-8 md:pb-3 flex items-center justify-between">
                  {(() => {
                    const handle = product.shop?.username ? `@${product.shop.username}` : null;
                    const shopIdOrHandle = handle || product.shop?._id || product.shop?.id || product.shop;
                    return (
                      <Link href={`/shop/${shopIdOrHandle}`} className="group flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted overflow-hidden border border-border shadow-sm">
                          <img src={product.shop?.avatar || '/defaultAvatar.jpeg'} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                            {product.shop?.name || "Official Store"}
                            {product.shop?.isVerified && <GoldCheck className="w-3.5 h-3.5" />}
                          </div>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Visit Shop</p>
                        </div>
                      </Link>
                    );
                  })()}
                  <div className="flex items-center gap-2">
                    <button onClick={handleWishlistToggle} className={`p-1.5 rounded-full hover:bg-muted transition-all ${isInWishlist(product._id) ? 'text-pink-500 bg-pink-500/10' : 'text-muted-foreground/30'}`}>
                      <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => setIsShareModalOpen(true)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground/30 transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Photo Section */}
                <div className="px-4 md:px-8 py-2 space-y-4">
                  <div className="relative inline-block max-w-full rounded-[1.25rem] border border-border overflow-hidden group cursor-zoom-in">
                    {(() => {
                      const src = productImages[activeImageIndex] || product.image;
                      return (
                        <>
                          <img 
                            src={src} 
                            alt={product.name}
                            className="w-full max-h-[600px] object-cover transition-transform duration-700 ease-out group-hover:scale-105 block"
                          />
                          <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-[1rem] border border-border shadow-xl shadow-foreground/5 flex flex-col items-end z-10 pointer-events-none">
                            <span className="text-primary font-black text-xs">{formatPrice(product.price)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {productImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {productImages.map((src: string, idx: number) => {
                        const isVideo = src && (src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm') || src.toLowerCase().endsWith('.mov'));
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${
                              activeImageIndex === idx ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-muted-foreground/30'
                            }`}
                          >
                            <img src={src} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Description & Info Section */}
                <div className="p-5 md:p-8 space-y-5">
                  <div className="space-y-2">
                    <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-tight">{product.name}</h1>
                    <p className="text-muted-foreground leading-relaxed text-[13px] md:text-[14px] font-medium max-w-3xl">{product.description}</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                      <ProductRating 
                        productId={product._id} 
                        initialRating={product.rating}
                        initialReviewsCount={product.reviewsCount}
                      />
                      
                        {/* Variations Section */}
                        <div className="space-y-4 max-w-md">
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">Select Size</div>
                              <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size: string) => (
                                  <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                      selectedSize === size 
                                        ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' 
                                        : 'bg-background border-border text-foreground hover:border-primary/50'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {product.variantOptions && product.variantOptions.length > 1 && (
                            <div className="space-y-2">
                              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">Select Variation</div>
                              <div className="flex flex-wrap gap-2">
                                {product.variantOptions.map((variant: any, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                      activeImageIndex === index 
                                        ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' 
                                        : 'bg-background border-border text-foreground hover:border-primary/50'
                                    }`}
                                  >
                                    {variant.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      <div className="flex items-center justify-between bg-muted rounded-xl p-3 border border-border max-w-md">
                        <div className="text-[10px] font-black text-foreground uppercase tracking-[0.1em]">Select Quantity</div>
                        <div className="flex items-center bg-background rounded-lg p-0.5 shadow-sm border border-border">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 hover:bg-muted rounded-md transition-all"><Minus className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <span className="w-10 text-center text-xs font-black text-foreground">{quantity}</span>
                          <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 hover:bg-muted rounded-md transition-all"><Plus className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <button 
                        onClick={() => {
                          if (product.sizes?.length > 0 && !selectedSize) {
                            alert("Please select a size");
                            return;
                          }
                          const currentImage = productImages[activeImageIndex] || product.image;
                          const variantName = product.variantOptions?.[activeImageIndex]?.name || `Option ${activeImageIndex + 1}`;
                          // Pass selected variant image to cart. The variant is the image itself.
                          addToCart(product._id, quantity, selectedSize, variantName, currentImage);
                        }}
                        className="w-full bg-foreground text-background h-12 rounded-xl font-black text-xs flex items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-foreground/10"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart — {formatPrice(product.price * quantity)}
                      </button>
                      
                      <div className="flex items-center justify-center gap-5 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] pt-1">
                        <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Secure</div>
                        <div className="flex items-center gap-1.5"><Truck className="w-3 h-3" /> Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reordered Sections: Comments first, then Recommended */}
            
            {/* Comments Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">Community Feedback</h2>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">{comments.length} comments</p>
                </div>
                <button 
                  onClick={() => setIsCommentModalOpen(true)}
                  className="px-4 py-2 bg-background border border-border text-foreground rounded-xl font-black text-[10px] hover:bg-muted transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Write Comment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isCommentsLoading ? (
                  [1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)
                ) : comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment._id} className="bg-muted/50 border border-border rounded-2xl p-4 space-y-2.5 relative group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-background border border-border">
                          <img src={comment.user?.avatar || '/defaultAvatar.jpeg'} alt="" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground">{comment.user?.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed">{comment.content}</p>
                      {currentUser && currentUser._id === comment.user?._id && (
                        <button 
                          onClick={() => deleteComment(comment._id)}
                          className="absolute top-3 right-3 p-1.5 text-muted-foreground/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 py-10 text-center bg-muted rounded-[1.5rem] border border-dashed border-border">
                    <p className="text-[11px] font-bold text-muted-foreground">No comments yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Products Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-foreground">Recommended for You</h2>
                <Link href="/shop" className="text-xs font-bold text-primary hover:underline">View All</Link>
              </div>

              <div className="divide-y divide-border bg-background border border-border rounded-[1.5rem] overflow-hidden shadow-sm">
                {isProductsLoading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse bg-muted" />)
                ) : recommendedProducts.length > 0 ? (
                  recommendedProducts.map((p: any) => (
                    <div 
                      key={p._id} 
                      onClick={() => router.push(`/shop/product/${p._id}`)}
                      className="p-4 hover:bg-muted transition-colors cursor-pointer group"
                    >
                      <div className="flex gap-4 md:gap-5 items-start">
                        <div className="w-24 md:w-32 relative inline-block rounded-2xl overflow-hidden border border-border shrink-0 flex items-start justify-center">
                          <img src={p.image} alt={p.name} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 block" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-[13px] md:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{p.name}</h3>
                              <span className="text-xs font-black text-primary shrink-0">{formatPrice(p.price)}</span>
                            </div>
                            <p className="text-[11px] md:text-xs font-medium text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold text-muted-foreground">
                            <div className="flex items-center gap-1"><MessageIcon className="w-3 h-3" /> {p.commentsCount || 0}</div>
                            {p.rating > 0 && <div className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-current" /> {p.rating}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-sm font-bold text-muted-foreground italic">no other product same as this one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Popular Shops */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <aside className="fixed top-[128px] w-[320px] h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar px-6 py-6 pb-24 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Popular Shops</h3>
              <div className="space-y-1">
                {popularShops.map((vendor: any) => (
                  <div 
                    key={vendor.id} 
                    className="p-3 hover:bg-muted transition-all cursor-pointer flex items-center justify-between gap-3 rounded-xl group"
                    onClick={() => router.push(`/shop/${vendor.handle || vendor.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                        <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-0.5">
                          <p className="text-sm font-black text-foreground truncate">{vendor.name}</p>
                          {vendor.verified && <GoldCheck className="w-3 h-3" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px]">{vendor.handle}</p>
                          <span className="text-muted-foreground/30">·</span>
                          <p className="text-[10px] font-bold text-muted-foreground">{vendor.followersCount} followers</p>
                        </div>
                      </div>
                    </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFollowToggle(vendor.id); }}
                        className={`text-[10px] font-black px-4 py-1.5 rounded-full transition-all ${
                          vendor.isFollowing
                            ? 'bg-muted text-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10' 
                            : 'bg-foreground text-background hover:bg-primary'
                        }`}
                      >
                        {vendor.isFollowing ? 'Following' : 'Follow'}
                      </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

      </div>

      <UniversalShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={isMounted ? window.location.href : ''} 
        title={product.name}
        type="product"
      />
      <CommentModal 
        isOpen={isCommentModalOpen} 
        onClose={() => setIsCommentModalOpen(false)} 
        productId={product._id} 
        productName={product.name} 
      />
    </div>
  );
};

export default ProductDetailsPage;
