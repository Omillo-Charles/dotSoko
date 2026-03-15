"use client";

import React, { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

export type FeedbackType = "product" | "shop";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string; // productId or shopId
  name: string; // productName or shopName
  type: FeedbackType;
  onSuccess?: (newRating: number, newCount?: number) => void;
}

const FeedbackModal = ({
  isOpen,
  onClose,
  id,
  name,
  type,
  onSuccess,
}: FeedbackModalProps) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleProductSubmit = async (rating: number) => {
    try {
      const response = await api.post(`/products/${id}/rate`, { rating });
      if (response.data.success) {
        toast.success("Thank you for your rating!");
        queryClient.invalidateQueries({ queryKey: ["product", id] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["featured-products"] });
        
        // Invalidate shop as well
        if (response.data.data?.shop || response.data.data?.shopId) {
          const shopId = response.data.data.shop?._id || response.data.data.shop || response.data.data.shopId;
          queryClient.invalidateQueries({ queryKey: ["shop", String(shopId)] });
        }
        queryClient.invalidateQueries({ queryKey: ["popular-shops"] });

        onSuccess?.(response.data.data.rating, response.data.data.reviewsCount);
        setTimeout(onClose, 1000);
      }
    } catch (error: any) {
      console.error("Error rating product:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating.");
    }
  };

  const handleShopSubmit = async () => {
    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      // Logic synthesized from ShopRatingModal.tsx
      const endpoints = id?.startsWith("@")
        ? [`/shops/handle/${id.slice(1)}/rate`, `/shops/handle/${id.slice(1)}/reviews`]
        : [`/shops/${id}/rate`, `/shops/${id}/reviews`];

      let response: any = null;
      let lastError: any = null;

      const rawId = id?.startsWith("@") ? id.slice(1) : id;
      const basePayload = { 
        rating: Math.max(1, Math.min(5, selectedRating)), 
        comment: comment.trim() 
      };

      // Try multiple payload variants as per legacy ShopRatingModal
      const variants = [
        basePayload,
        { rating: basePayload.rating },
        { stars: basePayload.rating, comment: basePayload.comment },
        { score: basePayload.rating, comment: basePayload.comment },
        { rating: basePayload.rating, review: basePayload.comment },
        { rating: basePayload.rating, content: basePayload.comment },
      ].map(v => ({
        ...v,
        shop: rawId,
        shopId: !id?.startsWith("@") ? rawId : undefined,
        handle: id?.startsWith("@") ? rawId : undefined,
      }));

      for (const ep of endpoints) {
        for (const payload of variants) {
          try {
            response = await api.post(ep, payload);
            if (response?.data?.success) break;
          } catch (err: any) {
            lastError = err;
            if (![404, 405, 500, 501].includes(Number(err?.response?.status))) throw err;
          }
        }
        if (response?.data?.success) break;
      }

      if (!response?.data?.success) {
        if (lastError) throw lastError;
        throw new Error("Failed to submit review");
      }

      toast.success("Thank you for your review!");
      const newRating = response.data.data?.rating;
      const newReviewsCount = response.data.data?.reviewsCount;

      // Update cache
      queryClient.setQueryData(["shop", id], (old: any) => 
        old ? { ...old, rating: newRating ?? old.rating, reviewsCount: newReviewsCount ?? old.reviewsCount } : old
      );
      queryClient.invalidateQueries({ queryKey: ["shop", id] });
      queryClient.invalidateQueries({ queryKey: ["shop-reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["popular-shops"] });

      onSuccess?.(newRating);
      setTimeout(() => {
        onClose();
        setSelectedRating(0);
        setComment("");
      }, 1000);

    } catch (error: any) {
      console.error("Error rating shop:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating.");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(`Please login to rate this ${type}`);
      return;
    }
    setIsSubmitting(true);
    if (type === "product") {
      // Product rating is immediate on star click in many UIs, 
      // but here we might want a submit button if we added comments.
      // Legacy RatingModal submitted on click.
      // I'll stick to that for product if comment is empty.
    } else {
      await handleShopSubmit();
    }
    setIsSubmitting(false);
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    if (type === "product") {
      setIsSubmitting(true);
      handleProductSubmit(rating).finally(() => setIsSubmitting(false));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${type === "product" ? "bg-amber-500/10" : "bg-primary/10"}`}>
              <Star className={`w-10 h-10 ${type === "product" ? "text-amber-500 fill-amber-500" : "text-primary fill-primary"}`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground leading-tight">
                Rate {type === "product" ? "Product" : "Shop"}
              </h3>
              <p className="text-muted-foreground font-medium text-sm px-4">
                How was your experience with <span className="text-foreground font-bold">"{name}"</span>?
              </p>
            </div>

            <div className="flex items-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                  className="relative p-1 transition-all hover:scale-125 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      (hoverRating || selectedRating) >= star
                        ? (type === "product" ? "fill-amber-400 text-amber-400" : "fill-primary text-primary")
                        : "text-muted-foreground/20 fill-transparent"
                    }`}
                  />
                </button>
              ))}
            </div>

            {type === "shop" && (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1 block text-left">
                    Your Review (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full min-h-[120px] p-4 rounded-2xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm font-medium outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedRating === 0}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    "SUBMIT REVIEW"
                  )}
                </button>
              </div>
            )}

            {type === "product" && (
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                {isSubmitting ? "Submitting..." : "Tap a star to rate"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
