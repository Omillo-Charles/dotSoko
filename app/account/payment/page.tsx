"use client";

import React from "react";
import { 
  CreditCard, 
  Smartphone, 
  Plus, 
  MoreVertical, 
  ShieldCheck, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft,
  Trash2,
  Lock
} from "lucide-react";
import { SettingsPageHeader } from "@/components/dashboard/SettingsPageHeader";

const PaymentMethodsPage = () => {
  const savedCards = [
    { id: "1", type: "Visa", last4: "4242", expiry: "12/25", isDefault: true, color: "from-blue-600 to-indigo-700" },
    { id: "2", type: "Mastercard", last4: "8888", expiry: "09/24", isDefault: false, color: "from-orange-500 to-red-600" }
  ];

  const mobileMoney = [
    { id: "mp-1", provider: "M-Pesa", phone: "+254 712 *** 890", isDefault: true },
    { id: "am-1", provider: "Airtel Money", phone: "+254 733 *** 123", isDefault: false }
  ];

  const recentTransactions = [
    { id: "trx-1", desc: "Premium Subscription", amount: -350, date: "Mar 10, 2026", status: "Successful", type: "debit" },
    { id: "trx-2", desc: "Payout - Order TRX-8921", amount: 12450, date: "Mar 08, 2026", status: "Successful", type: "credit" },
    { id: "trx-3", desc: "Wallet Top-up", amount: 5000, date: "Mar 05, 2026", status: "Successful", type: "credit" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      <SettingsPageHeader
        icon={<CreditCard className="w-12 h-12 text-primary" />}
        badge={{ label: "Encrypted & Secured", icon: <ShieldCheck className="w-3.5 h-3.5" /> }}
        title="Payment Methods"
        description="Manage your digital assets and transaction protocols securely."
        glowColor="from-primary/30 via-indigo-500/30 to-primary/30"
        action={
          <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add Method
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Saved Cards Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Saved Instruments</h2>
          </div>

          <div className="space-y-6">
            {savedCards.map((card) => (
              <div 
                key={card.id}
                className={`relative group h-56 rounded-[2.5rem] bg-gradient-to-br ${card.color} p-10 overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20`}
              >
                {/* Chip Mockup */}
                <div className="absolute top-10 left-10 w-12 h-9 bg-yellow-400/30 backdrop-blur-md rounded-lg overflow-hidden flex items-center justify-center border border-yellow-200/20">
                    <div className="grid grid-cols-3 w-full h-full divide-x divide-y divide-yellow-200/10">
                        {Array.from({length: 6}).map((_, i) => <div key={i} />)}
                    </div>
                </div>

                <div className="absolute top-10 right-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-border flex items-center justify-center">
                        <MoreVertical className="w-5 h-5 text-white" />
                    </div>
                </div>

                <div className="mt-16 space-y-4">
                    <p className="text-2xl text-white font-mono tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-widest text-white/50">Exp Date</p>
                            <p className="text-sm text-white font-bold">{card.expiry}</p>
                        </div>
                        <h4 className="text-xl font-black italic text-white/80">{card.type}</h4>
                    </div>
                </div>

                {card.isDefault && (
                    <div className="absolute bottom-6 right-10 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/30">
                        Default
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Money & Security */}
        <div className="space-y-10">
            
            {/* Mobile Money Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em]">Mobile Money Hub</h2>
                </div>

                <div className="grid gap-4">
                    {mobileMoney.map((mm) => (
                        <div key={mm.id} className="group bg-background/40 backdrop-blur-3xl border border-border shadow-sm p-6 rounded-[2rem] flex items-center justify-between hover:bg-white/5 transition-all transition-colors duration-500 hover:border-primary/30">
                            <div className="flex items-center gap-5 font-black uppercase italic">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-border/50 ${mm.provider === 'M-Pesa' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground tracking-widest leading-none mb-1">{mm.provider}</p>
                                    <p className="text-lg text-foreground tracking-tighter">{mm.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {mm.isDefault && <span className="text-[8px] font-black text-primary px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">PRIMARY</span>}
                                <button className="p-3 text-muted-foreground/30 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Protocol Info */}
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 space-y-6 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Security Protocol</h3>
                </div>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed relative z-10">
                    Your financial signatures are encrypted using military-grade security layers. We never store full card numbers locally.
                </p>
                <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-widest relative z-10">
                    <ShieldCheck className="w-4 h-4" />
                    Verified by dotSoko Auth
                </div>
            </div>

        </div>
      </div>

      {/* Transaction Snapshot */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Protocol History</h2>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">View Ledger</button>
        </div>

        <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="divide-y divide-white/5">
                {recentTransactions.map((trx) => (
                    <div key={trx.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${trx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {trx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-foreground italic leading-none mb-2">{trx.desc}</h4>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{trx.id} • {trx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-2xl font-black italic tracking-tighter ${trx.type === 'credit' ? 'text-emerald-500' : 'text-foreground'}`}>
                                {trx.type === 'credit' ? '+' : '-'} KES {Math.abs(trx.amount).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">
                                {trx.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

    </div>
  );
};

export default PaymentMethodsPage;
