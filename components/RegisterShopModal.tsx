"use client";

import React from "react";
import Link from "next/link";
import { X, Store, ArrowRight } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const RegisterShopModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
      <div
        className="bg-background w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center">
              <Store className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground leading-tight">Create Your Shop</h3>
              <p className="text-muted-foreground font-medium text-sm px-4">
                You don’t have a shop yet. Create one now to access premium seller tools.
              </p>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/account/seller/create"
                onClick={() => onSuccess?.()}
                className="inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Store className="w-4 h-4" />
                Create Shop
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={onClose}
                className="py-3 rounded-2xl bg-muted text-foreground font-black hover:bg-muted/80 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
