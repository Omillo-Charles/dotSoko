"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  Plus, 
  Building2, 
  Smartphone, 
  ChevronRight, 
  ShieldCheck, 
  ArrowLeft,
  Settings,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Eye,
  Copy,
  Info
} from "lucide-react";

const SellerPaymentPage = () => {
  const [activeTab, setActiveTab] = useState("collections");

  const collectionMethods = [
    { 
      id: "1", 
      type: "mpesa-till", 
      title: "M-Pesa Buy Goods Till", 
      details: "5521908", 
      label: "Business Till",
      isPrimary: true,
      icon: <Smartphone className="w-6 h-6" />
    },
    { 
      id: "2", 
      type: "mpesa-paybill", 
      title: "M-Pesa Paybill", 
      details: "Business: 400200, Acc: 99120", 
      label: "Co-op Bank Paybill",
      isPrimary: false,
      icon: <QrCode className="w-6 h-6" />
    }
  ];

  const bankDetails = [
    { 
      id: "bank-1", 
      bank: "KCB Bank Kenya", 
      accountName: "Millo Soko Digital Store",
      accountNumber: "1288009912",
      branch: "Main Branch",
      isPrimary: false
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/account/seller" 
            className="p-4 bg-background/60 backdrop-blur-3xl rounded-3xl transition-all text-muted-foreground hover:text-foreground border border-border shadow-sm shadow-xl group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">Payment & Collections</h1>
            <p className="text-muted-foreground font-medium text-lg">Configure how customers pay for your products.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-primary text-primary-foreground rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <Plus className="w-5 h-5" />
          Add Technique
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Collection Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Collection Nodes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Collection Nodes</h2>
              </div>
            </div>

            <div className="grid gap-6">
              {collectionMethods.map((method) => (
                <div 
                  key={method.id}
                  className="group relative overflow-hidden bg-background/60 backdrop-blur-3xl rounded-[3rem] border border-border shadow-sm p-8 transition-all duration-500 hover:shadow-2xl hover:border-primary/30"
                >
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[1.8rem] bg-muted/50 flex items-center justify-center text-primary border border-border shadow-sm group-hover:bg-primary/10 transition-colors duration-500 shrink-0">
                        {method.icon}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-foreground text-2xl tracking-tighter italic uppercase">{method.title}</h4>
                          {method.isPrimary && (
                            <span className="px-3 py-1 bg-primary text-[9px] font-black text-white uppercase tracking-widest rounded-full">Primary</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                           <p className="text-3xl font-black text-primary tracking-tight">{method.details}</p>
                           <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                              <Copy className="w-5 h-5" />
                           </button>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">{method.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="px-6 py-3 bg-muted/50 hover:bg-muted rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Edit Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bank Transfer Protocols */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Bank Transfers</h2>
            </div>

            <div className="grid gap-6">
              {bankDetails.map((bank) => (
                <div 
                  key={bank.id}
                  className="group p-10 bg-background/60 backdrop-blur-3xl rounded-[3rem] border border-border shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Banking Institution</p>
                          <h4 className="text-2xl font-black text-foreground italic">{bank.bank}</h4>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Account Holder</p>
                          <p className="text-xl font-bold text-foreground">{bank.accountName}</p>
                       </div>
                    </div>
                    <div className="space-y-6 md:pl-10 md:border-l border-border/50">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Account Number</p>
                          <p className="text-3xl font-black text-primary tracking-tighter">{bank.accountNumber}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Branch Code</p>
                          <p className="text-lg font-bold text-foreground italic">{bank.branch}</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar View & Education */}
        <div className="space-y-10">
          
          {/* Buyer Experience Preview */}
          <div className="space-y-6">
            <div className="px-4">
              <h3 className="text-2xl font-black text-foreground tracking-tight">Buyer Experience</h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">What your customers see at checkout.</p>
            </div>

            <div className="relative group p-1 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 rounded-[3.5rem] overflow-hidden">
               <div className="relative overflow-hidden rounded-[3.2rem] bg-background/80 backdrop-blur-3xl border border-border shadow-2xl p-8 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest">SokoPay Checkout</span>
                     </div>
                     <Settings className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="p-6 rounded-3xl bg-muted/40 border border-border flex items-center justify-between shadow-inner">
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Digital Payment</p>
                        <p className="text-lg font-black text-primary">KES 2,450</p>
                     </div>
                     <Eye className="w-5 h-5 text-primary" />
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Select Method</p>
                     <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 ring-1 ring-primary/30">
                           <Smartphone className="w-5 h-5 text-primary" />
                           <span className="text-sm font-black text-foreground">{collectionMethods[0].details}</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border opacity-50">
                           <QrCode className="w-5 h-5 text-muted-foreground" />
                           <span className="text-sm font-bold text-muted-foreground">Other Methods</span>
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl">Complete Order</button>
               </div>
               
               {/* Reflection Tag */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 pointer-events-none">
                  <div className="px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-2xl">Preview Mode</div>
               </div>
            </div>
          </div>

          {/* Security Advisory */}
          <div className="p-8 bg-amber-500/5 backdrop-blur-xl rounded-[2.5rem] border border-amber-500/20 space-y-6">
            <div className="flex items-center gap-3 text-amber-500">
               <ShieldCheck className="w-6 h-6" />
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] italic">Trust Protocol</h4>
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Ensure your <span className="text-amber-500 font-bold italic">Till/Paybill</span> numbers are accurate. Buyers will pay directly into these accounts during the digital checkout flow.
            </p>
            <div className="flex items-start gap-4 p-4 bg-background/50 rounded-2xl border border-border shadow-inner">
               <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
               <p className="text-[9px] font-black text-muted-foreground uppercase leading-tight tracking-tighter italic">
                 Any changes to primary nodes will trigger a re-verification of your shop's security score.
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerPaymentPage;
