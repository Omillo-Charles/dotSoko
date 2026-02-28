"use client";

import React from "react";
import { X, Repeat, ShoppingCart } from "lucide-react";

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export const RepostModal: React.FC<RepostModalProps> = ({
  isOpen,
  onClose,
  productName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl shadow-lg w-full max-w-xs p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-foreground mb-2">Repost or Resell?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose an action for <span className="font-bold text-foreground">{productName}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
            <Repeat className="w-4 h-4" />
            Repost
          </button>
          <button className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-muted text-foreground rounded-lg font-semibold text-sm hover:bg-muted/80 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Resell
          </button>
        </div>
      </div>
    </div>
  );
};
