"use client";

import React from "react";
import { X, Camera, Plus, ShoppingBag } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpdate: () => void;
  onSelectProduct: () => void;
};

export const CreateChoiceModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSelectUpdate, 
  onSelectProduct 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-background rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black leading-tight">Create</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select what you want to post</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Choices */}
        <div className="p-6 grid grid-cols-1 gap-4">
          <button 
            onClick={() => {
              onSelectUpdate();
              onClose();
            }}
            className="flex items-center gap-4 p-4 rounded-3xl bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/20 transition-all group group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-foreground">Post Update</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Share a photo or video with followers</p>
            </div>
          </button>

          <button 
            onClick={() => {
              onSelectProduct();
              onClose();
            }}
            className="flex items-center gap-4 p-4 rounded-3xl bg-muted/50 hover:bg-secondary/10 border border-border hover:border-secondary/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-foreground">New Product</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">List a new item for sale in your shop</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
