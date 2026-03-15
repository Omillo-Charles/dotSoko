"use client";

import React, { useEffect, useRef } from "react";
import { X, LucideIcon } from "lucide-react";

export interface ChoiceItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "default";
}

interface ChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: ChoiceItem[];
  layout?: "center" | "popover";
  position?: { top: number; left: number };
}

const ChoiceModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  layout = "center",
  position,
}: ChoiceModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (layout === "popover" && position) {
    return (
      <div
        ref={modalRef}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        className="absolute z-[120] bg-background border border-border rounded-2xl shadow-xl w-48 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="p-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

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
        {(title || subtitle) && (
          <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
            <div>
              {title && <h3 className="text-lg font-black leading-tight">{title}</h3>}
              {subtitle && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Choices */}
        <div className="p-6 grid grid-cols-1 gap-4">
          {items.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className={`flex items-center gap-4 p-4 rounded-3xl bg-muted/50 border border-border transition-all group ${
                item.variant === "primary" ? "hover:bg-primary/10 hover:border-primary/20" :
                item.variant === "secondary" ? "hover:bg-secondary/10 hover:border-secondary/20" :
                item.variant === "danger" ? "hover:bg-red-500/10 hover:border-red-500/20" :
                "hover:bg-muted hover:border-muted-foreground/20"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                item.variant === "primary" ? "bg-primary/10 text-primary" :
                item.variant === "secondary" ? "bg-secondary/10 text-secondary" :
                item.variant === "danger" ? "bg-red-500/10 text-red-500" :
                "bg-muted text-muted-foreground"
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-foreground">{item.label}</p>
                {item.description && <p className="text-[10px] font-medium text-muted-foreground uppercase">{item.description}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoiceModal;
