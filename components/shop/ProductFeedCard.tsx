"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Star, MessageCircle, Repeat2, Heart, Share2, ShoppingCart, Send 
} from "lucide-react";
import { GoldCheck } from "@/components/ui/CommonUI";
import { ImageCarousel } from "@/components/media/ImageCarousel";

interface ProductFeedCardProps {
  product: any;
  isInWishlist: (id: string) => boolean;
  repostPopover: { isOpen: boolean; productId: string | null };
  onProductClick: (p: any) => void;
  onAddToCart: (e: React.MouseEvent, p: any) => void;
  onWishlist: (e: React.MouseEvent, p: any) => void;
  onRatingOpen: (productId: string, productName: string, initialRating: number) => void;
  onCommentOpen: (productId: string, productName: string) => void;
  onRepostToggle: (e: React.MouseEvent, productId: string) => void;
  onShareOpen: (url: string, title: string) => void;
}

export const ProductFeedCard = ({
  product,
  isInWishlist,
  repostPopover,
  onProductClick,
  onAddToCart,
  onWishlist,
  onRatingOpen,
  onCommentOpen,
  onRepostToggle,
  onShareOpen,
}: ProductFeedCardProps) => {
  const router = useRouter();
  const productId = product._id || product.id;

  const handleShopNav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const handle = product.shop?.username
      ? `@${product.shop.username}`
      : product.vendor?.handle?.startsWith('@')
        ? product.vendor.handle
        : product.vendor?.handle
          ? `@${product.vendor.handle}`
          : null;
    const shopIdOrHandle = handle || product.shop?._id || product.shop?.id || product.shop || product.vendor?.id;
    if (shopIdOrHandle) router.push(`/shop/${shopIdOrHandle}`);
  };

  return (
    <div
      onClick={() => onProductClick(product)}
      className="p-4 md:p-6 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex gap-3 md:gap-4">
        {/* Shop Avatar */}
        <div className="shrink-0">
          <div
            onClick={handleShopNav}
            className="w-12 h-12 rounded-full overflow-hidden border border-border bg-muted hover:opacity-90 transition-opacity"
          >
            <img
              src={product.shop?.avatar || product.vendor?.avatar || '/defaultAvatar.jpeg'}
              alt={product.shop?.name || product.vendor?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                onClick={handleShopNav}
                className="text-sm font-black text-foreground truncate hover:underline flex items-center gap-0.5"
              >
                {product.shop?.name || product.vendor?.name}
                {(product.shop?.isVerified || product.vendor?.verified) && <GoldCheck className="w-4 h-4" />}
              </span>
              {(product.shop?.username || product.vendor?.handle) && (
                <span className="text-muted-foreground text-xs truncate">
                  @{product.shop?.username || product.vendor?.handle?.replace('@', '')}
                </span>
              )}
              <span className="text-muted-foreground text-xs shrink-0">
                · {product.time || new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRatingOpen(productId, product.name, product.rating);
                }}
                className="text-muted-foreground/70 hover:text-amber-500 p-1.5 rounded-full hover:bg-amber-500/10 transition-all"
                title="Rate Product"
              >
                <Star className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground/80 text-[13px] leading-relaxed mb-3 whitespace-pre-wrap">
            {product.description || product.content}
          </p>

          {/* Product Image */}
          {(product.images?.[0] || product.image) && (
            <div className="relative inline-block max-w-full mt-3 mb-3">
              <ImageCarousel
                images={product.images?.length > 0 ? product.images : (product.image ? [product.image] : [])}
                alt={product.name}
              />
              <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-xl shadow-foreground/5 flex flex-col items-end z-20 pointer-events-none">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between max-w-md text-muted-foreground -ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommentOpen(productId, product.name);
              }}
              className="flex items-center gap-0 group transition-colors hover:text-primary"
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-xs font-bold">{product.commentsCount || product.comments || 0}</span>
            </button>

            <button
              onClick={(e) => onRepostToggle(e, product._id)}
              className="flex items-center gap-0 group transition-colors hover:text-emerald-500"
            >
              <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-xs font-bold">{product.reposts || 0}</span>
            </button>

            <button
              onClick={(e) => onWishlist(e, product)}
              className={`flex items-center gap-0 group transition-colors ${
                isInWishlist(productId) ? 'text-pink-500' : 'hover:text-pink-500'
              }`}
              title={isInWishlist(productId) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <div className={`p-1.5 rounded-full transition-colors ${
                isInWishlist(productId) ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'
              }`}>
                <Heart className={`w-[18px] h-[18px] ${isInWishlist(productId) ? 'fill-current' : ''}`} />
              </div>
            </button>

            <button
              onClick={(e) => {
                if (product.sizes?.length > 0 || product.colors?.length > 0) {
                  onProductClick(product);
                } else {
                  onAddToCart(e, product);
                }
              }}
              className="flex items-center gap-0 group transition-colors hover:text-primary"
              aria-label="Add to Cart"
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <ShoppingCart className="w-[18px] h-[18px]" />
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const productUrl = `${window.location.origin}/shop/product/${productId}`;
                onShareOpen(productUrl, product.name);
              }}
              className="flex items-center gap-2 group transition-colors hover:text-foreground"
            >
              <div className="p-2 rounded-full group-hover:bg-muted transition-colors">
                <Share2 className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
