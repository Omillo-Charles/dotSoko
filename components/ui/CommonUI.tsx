"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import api from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

/**
 * GoldCheck Component
 * Verified business badge with a gold gradient
 */
export const GoldCheck = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Verified Business Account"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path
        d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z"
        fill="url(#gold-gradient)"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * ThemeToggle Component
 * Switch between light and dark modes
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex flex-col items-center group transition-colors text-slate-50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-6 h-6 transition-colors group-hover:text-primary" />
      ) : (
        <Moon className="w-6 h-6 transition-colors group-hover:text-primary" />
      )}
      <span className="hidden md:block text-xs mt-1 font-medium text-slate-400 group-hover:text-primary transition-colors">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}

/**
 * ProductRating Component
 * Inline star rating for products
 */
interface ProductRatingProps {
  productId: string;
  initialRating?: number;
  initialReviewsCount?: number;
  onRatingUpdate?: (newRating: number, newCount: number) => void;
}

export const ProductRating = ({ 
  productId, 
  initialRating = 0, 
  initialReviewsCount = 0,
  onRatingUpdate 
}: ProductRatingProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (rating: number) => {
    if (!user) {
      toast.error("Please login to rate this product");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/products/${productId}/rate`, { rating });
      
      if (response.data.success) {
        toast.success("Thank you for your rating!");
        setSelectedRating(rating);
        
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['featured-products'] });

        if (onRatingUpdate) {
          onRatingUpdate(response.data.data.rating, response.data.data.reviewsCount);
        }
      }
    } catch (error: any) {
      console.error("Error rating product:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 py-6 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Product Rating
        </h3>
        <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
            {initialRating.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold text-amber-600/60 dark:text-amber-400/60 ml-0.5">
            ({initialReviewsCount})
          </span>
        </div>
      </div>

      <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-border">
        <p className="text-sm font-bold text-muted-foreground">
          How would you rate this product?
        </p>
        
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              className="relative p-1 transition-all hover:scale-125 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  (hoverRating || selectedRating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30 fill-transparent"
                }`}
              />
            </button>
          ))}
        </div>

        {isSubmitting && (
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Submitting...</span>
          </div>
        )}
      </div>
    </div>
  );
};
