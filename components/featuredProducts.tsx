"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, ChevronRight, Heart, Loader2, Share2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useFeaturedProducts, usePersonalizedFeed, useTrackActivity } from "@/hooks/useProducts";
import RatingModal from "./RatingModal";
import ShareModal from "./ShareModal";
import CommentModal from "./CommentModal";

const FeaturedProducts = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const trackActivity = useTrackActivity();
  
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

  const { data: products = [], isLoading } = usePersonalizedFeed(12);


  if (isLoading) {
    return (
      <section className="bg-muted py-12">
        <div className="flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

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

  return (
    <section className="bg-muted">
      <div className="w-full px-4 md:px-8 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">For You</h2>
          <Link href="/shop" className="text-primary flex items-center gap-1 font-medium">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {(products || []).map((p: any) => (
            <div key={p._id || Math.random()} className="bg-background border border-border rounded-[1.25rem] overflow-hidden group">
              <div className="relative aspect-square bg-muted cursor-pointer flex items-center justify-center overflow-hidden border-b border-border" onClick={() => handleProductClick(p)}>
                {(() => {
                  const src = p.image || "/placeholder-product.jpg";
                  const allowed = typeof src === 'string' && /^https?:\/\/(ik\.imagekit\.io|api\.dicebear\.com)\//.test(src);
                  if (allowed) {
                    return (
                      <Image
                        src={src}
                        alt={p.name || "Product"}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        priority={false}
                      />
                    );
                  }
                  return (
                    <img
                      src={src}
                      alt={p.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
                <button 
                  onClick={(e) => handleAddToCart(e, p)}
                  className="absolute top-2 left-2 bg-background/80 hover:bg-background rounded-full p-2 shadow transition-all hover:scale-110 active:scale-95 z-10"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4 text-foreground" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p._id) {
                      const productUrl = `${window.location.origin}/shop/product/${p._id}`;
                      setShareModal({
                        isOpen: true,
                        url: productUrl,
                        title: p.name || "Product"
                      });
                    }
                  }}
                  className="absolute bottom-2 left-2 bg-background/80 hover:bg-background rounded-full p-2 shadow transition-all hover:scale-110 z-10 text-foreground"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p._id) {
                      setRatingModal({
                        isOpen: true,
                        productId: p._id,
                        productName: p.name || "Product",
                        initialRating: p.rating || 0
                      });
                    }
                  }}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full p-2 shadow transition-all hover:scale-110 z-10 text-amber-500"
                  title="Rate Product"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p._id) {
                      setCommentModal({
                        isOpen: true,
                        productId: p._id,
                        productName: p.name || "Product"
                      });
                    }
                  }}
                  className="absolute bottom-2 right-2 bg-background/80 hover:bg-background rounded-full p-2 shadow transition-all hover:scale-110 z-10 text-primary"
                  title="Comment on Product"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isInWishlist(p._id) ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100 group-hover:scale-100'
                }`}>
                  <Heart 
                    onClick={(e) => handleWishlist(e, p)}
                    className={`w-12 h-12 cursor-pointer drop-shadow-lg transition-all ${
                      isInWishlist(p._id) ? "text-pink-500 fill-current" : "text-white/80 hover:text-pink-500"
                    }`} 
                  />
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-3 h-3 ${
                        (p.rating || 0) >= s 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground/20 fill-muted"
                      }`} 
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">({p.rating?.toFixed(1) || "0.0"})</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleProductClick(p)}>
                  {p.name || "Untitled Product"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
                  {p.description || "No description available"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-black text-primary">
                    KES {p.price?.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => p._id && router.push(`/shop/product/${p._id}`)}
                    className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
      </section>
    );
  };

export default FeaturedProducts;
