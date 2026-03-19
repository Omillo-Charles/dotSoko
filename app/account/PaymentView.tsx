"use client";

import React from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft,
  ExternalLink,
  Lock
} from "lucide-react";
import Link from "next/link";

export const PaymentView = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link 
            href="/account?view=overview" 
            className="p-4 hover:bg-background/60 backdrop-blur-3xl rounded-2xl transition-all text-muted-foreground hover:text-foreground border border-border shadow-sm group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Payment Methods</h1>
            <p className="text-muted-foreground mt-1 font-medium text-lg leading-none flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Manage your cards and mobile money safely.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-background/20 backdrop-blur-3xl border-2 border-dashed border-border shadow-sm rounded-[4rem] group transition-all hover:bg-white/[0.02]">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
          <CreditCard className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight mb-4">Payment features coming soon</h2>
        <p className="text-muted-foreground mb-10 font-medium max-w-sm mx-auto text-lg leading-relaxed">
          We're finalizing our secure financial protocols. Soon you'll be able to manage multiple payment methods with bank-grade encryption.
        </p>
        <div className="flex items-center gap-4 text-emerald-500 text-[10px] font-black bg-emerald-500/10 px-8 py-4 rounded-full border border-emerald-500/20 shadow-2xl">
          <Lock className="w-4 h-4" />
          Protocol synchronization in progress
        </div>
      </div>

      <div className="mt-16 p-10 md:p-16 rounded-[4.5rem] bg-primary/5 border border-primary/20 shadow-[0_50px_100px_rgba(0,0,0,0.2)] flex flex-col md:grid md:grid-cols-[auto_1fr_auto] items-center gap-12 relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[140px] group-hover:scale-150 transition-transform duration-1000" />
        <div className="w-20 h-20 bg-primary/20 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center text-primary border border-primary/20 shadow-2xl relative z-10">
          <ExternalLink className="w-10 h-10" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h4 className="text-3xl font-black text-foreground tracking-tighter lg:text-4xl">Need help?</h4>
          <p className="text-muted-foreground font-medium mt-2 text-lg">Our team is here to assist you with any questions about your account security.</p>
        </div>
        <Link 
          href="/contact"
          className="bg-primary text-primary-foreground px-12 py-6 rounded-[2.5rem] text-xs font-black hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 shrink-0 relative z-10 hover:shadow-primary/50"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
};
