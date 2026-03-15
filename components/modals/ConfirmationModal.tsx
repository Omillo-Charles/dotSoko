"use client";

import React from "react";
import { X, LucideIcon, AlertTriangle, Info, LogOut, CheckCircle2 } from "lucide-react";

export type ConfirmationVariant = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon: Icon,
  variant = "info",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
          buttonBg: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
          defaultIcon: LogOut,
        };
      case "warning":
        return {
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
          buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
          defaultIcon: AlertTriangle,
        };
      case "success":
        return {
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
          buttonBg: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
          defaultIcon: CheckCircle2,
        };
      default:
        return {
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
          buttonBg: "bg-primary hover:opacity-90 shadow-primary/20",
          defaultIcon: Info,
        };
    }
  };

  const styles = getVariantStyles();
  const DisplayIcon = Icon || styles.defaultIcon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-background rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-pop border border-border">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 ${styles.iconBg} rounded-[2rem] flex items-center justify-center mx-auto mb-6`}>
            <DisplayIcon className={`w-10 h-10 ${styles.iconColor}`} />
          </div>

          {/* Text */}
          <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground font-medium leading-relaxed mb-8">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-sm hover:bg-accent hover:text-foreground transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-8 py-4 ${styles.buttonBg} text-primary-foreground rounded-2xl font-black text-sm transition-all shadow-lg uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
