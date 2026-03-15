"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Phone, 
  Crown, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Zap,
  ArrowRight,
  BadgeCheck,
  RefreshCcw
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  isAnnual: boolean;
}

export const PremiumUpgradeModal = ({ 
  isOpen, 
  onClose, 
  planName, 
  price, 
  isAnnual 
}: PremiumUpgradeModalProps) => {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isWaitingForCallback, setIsWaitingForCallback] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Poll for payment status if waiting
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isWaitingForCallback && checkoutRequestId && isOpen) {
      intervalId = setInterval(async () => {
        // Don't auto-poll if manually checking to avoid race conditions/spam
        if (isCheckingStatus) return;

        try {
          const response = await api.get(`/payments/status/${checkoutRequestId}`);
          if (response.data.success && response.data.status === 'completed') {
            setIsWaitingForCallback(false);
            toast.success("Payment Verified!", {
              description: "Welcome to Premium! Redirecting to your dashboard...",
            });
            
            // Force refresh user data to update isPremium status
            await refreshUser();
            
            setTimeout(() => {
              onClose();
              window.location.href = "/account/seller";
            }, 1000);
          } else if (response.data.status === 'failed') {
            setIsWaitingForCallback(false);
            toast.error("Payment Failed", {
              description: "Transaction was cancelled or failed. Please try again.",
            });
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 5000); // Slow down polling to 5 seconds since we have a manual button and backend query
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isWaitingForCallback, checkoutRequestId, onClose, router, isOpen, isCheckingStatus, refreshUser]);

  const handleManualCheck = async () => {
    if (!checkoutRequestId) return;
    setIsCheckingStatus(true);
    try {
        const response = await api.get(`/payments/status/${checkoutRequestId}`);
        if (response.data.success && response.data.status === 'completed') {
            setIsWaitingForCallback(false);
            toast.success("Payment Verified!", {
                description: "Welcome to Premium! Redirecting to your dashboard...",
            });
            
            // Force refresh user data to update isPremium status
            await refreshUser();
            
            setTimeout(() => {
                onClose();
                window.location.href = "/account/seller";
            }, 1000);
        } else if (response.data.status === 'failed') {
             setIsWaitingForCallback(false);
             toast.error("Payment Failed", { description: "Transaction failed or was cancelled." });
        } else {
             toast.info("Payment Pending", { description: "We are still waiting for confirmation. If you have paid, please wait a moment and try again." });
        }
    } catch (error) {
        console.error("Manual check error:", error);
        toast.error("Error checking status");
    } finally {
        setIsCheckingStatus(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Basic formatting for the backend (though backend is robust)
      let cleanPhone = phoneNumber.replace(/\D/g, "");
      
      console.log(`Sending STK push for amount: ${price}`);
      
      const response = await api.post("/payments/stk-push", {
        phoneNumber: cleanPhone,
        amount: price.replace(/,/g, ""), // Remove commas if any
        metadata: {
          planName,
          isAnnual,
          type: "premium_upgrade"
        }
      });

      if (response.data.success) {
        setCheckoutRequestId(response.data.data.CheckoutRequestID);
        setIsWaitingForCallback(true);
        toast.success("STK Push Sent!", {
          description: "Please check your phone for the M-Pesa PIN prompt.",
        });
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error("Payment Failed", {
        description: error.friendlyMessage || "Could not initiate M-Pesa payment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-[380px] max-h-[85vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-amber-500/20 custom-scrollbar">
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-1 shadow-xl border border-white/30">
              <Crown className="w-7 h-7 text-white" />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95 group"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isWaitingForCallback ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-foreground">Waiting for Payment</h3>
                <p className="text-xs font-bold text-muted-foreground px-4">
                  Please enter your M-Pesa PIN on your phone to complete the upgrade.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-black">1</div>
                  <p className="text-[10px] font-bold text-amber-900 text-left">Check your phone for the M-Pesa prompt</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-black">2</div>
                  <p className="text-[10px] font-bold text-amber-900 text-left">Enter your PIN to authorize KES {price}</p>
                </div>
              </div>
              
              <button
                onClick={handleManualCheck}
                disabled={isCheckingStatus}
                className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                {isCheckingStatus ? "Verifying..." : "I have paid, check status"}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-foreground tracking-tight">Upgrade to {planName}</h2>
                <p className="text-[11px] font-bold text-muted-foreground">Enter your M-Pesa phone number</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-4">
                    Billing Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <Phone className="w-3.5 h-3.5 text-amber-500 group-focus-within:text-amber-600 transition-colors" />
                      <span className="text-xs font-bold text-muted-foreground/50 border-r border-border pr-2">+254</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="0700 000 000"
                      className="w-full pl-24 pr-5 py-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 shadow-sm transition-all font-bold text-foreground placeholder:text-muted-foreground/30 text-sm"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-[2rem] p-5 border border-amber-500/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Selected Plan</span>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{planName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Billing Cycle</span>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{isAnnual ? "Annually" : "Monthly"}</span>
                  </div>
                  <div className="h-px bg-amber-500/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">Total Amount</span>
                    <span className="text-base font-black text-amber-600 tracking-tight">KES {price}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || (phoneNumber.startsWith("0") ? phoneNumber.length < 10 : phoneNumber.length < 9)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay with M-Pesa
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Instant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
