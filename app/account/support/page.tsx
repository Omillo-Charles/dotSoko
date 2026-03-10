"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  ChevronRight, 
  ExternalLink, 
  Package, 
  CreditCard, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  LifeBuoy,
  CheckCircle2,
  MapPin
} from "lucide-react";

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      id: "1",
      category: "Orders",
      icon: Package,
      questions: [
        "How do I track my order?",
        "Can I cancel my order?",
        "What is the return policy?"
      ]
    },
    {
      id: "2",
      category: "Payments",
      icon: CreditCard,
      questions: [
        "What payment methods are accepted?",
        "Why was my payment declined?",
        "How do I get a refund?"
      ]
    },
    {
      id: "3",
      category: "Account",
      icon: User,
      questions: [
        "How do I reset my password?",
        "Can I change my email address?",
        "How do I delete my account?"
      ]
    },
    {
      id: "4",
      category: "Addresses",
      icon: MapPin,
      questions: [
        "How do I add a new address?",
        "Can I have multiple shipping addresses?",
        "How do I set a default address?"
      ]
    }
  ];

  const contactOptions = [
    {
      id: "chat",
      title: "Live Chat",
      desc: "Instant help from our team",
      icon: MessageSquare,
      status: "Online",
      color: "emerald"
    },
    {
      id: "email",
      title: "Email Support",
      desc: "Response within 24 hours",
      icon: Mail,
      status: "Available",
      color: "blue"
    },
    {
      id: "phone",
      title: "Phone Support",
      desc: "Mon-Fri, 9am - 5pm",
      icon: Phone,
      status: "Available",
      color: "orange"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase leading-none underline decoration-primary/30 underline-offset-8">Help & Support</h1>
          <p className="text-muted-foreground font-medium text-base">How can we assist you today?</p>
        </div>
        <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
                type="text" 
                placeholder="Search help articles..."
                className="w-full bg-muted/30 border border-border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* FAQ & Knowledge Base */}
        <div className="xl:col-span-2 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq) => (
                    <div key={faq.id} className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2.5rem] p-8 space-y-6 hover:bg-white/5 transition-all duration-500 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <faq.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight">{faq.category}</h3>
                        </div>
                        <div className="space-y-3">
                            {faq.questions.map((q, i) => (
                                <button key={i} className="w-full flex items-center justify-between text-left group/item">
                                    <span className="text-sm font-medium text-muted-foreground group-hover/item:text-foreground transition-colors">{q}</span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover/item:text-primary transition-all group-hover/item:translate-x-1" />
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline pt-2">
                            View All {faq.category} Articles
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Account Security Card */}
                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group col-span-1 md:col-span-2 md:aspect-[3/1] flex flex-col justify-center">
                    <div className="absolute -right-10 -top-10 w-60 h-60 bg-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-4 max-w-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Security Center</h3>
                        </div>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                            Protect your account with two-factor authentication, secure password management, and privacy controls.
                        </p>
                        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 w-fit">
                            Visit Security Hub
                        </button>
                    </div>
                </div>
            </div>

            {/* Ticket History Snapshot */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em]">Active Requests</h2>
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">2 Tickets Found</span>
                </div>
                <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2.5rem] overflow-hidden">
                    <div className="divide-y divide-white/5">
                        <div className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                    <LifeBuoy className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">Payment Verification Issue</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium">Ticket #TKT-8921 • Last updated 2 hours ago</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-orange-500 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20 uppercase tracking-widest">Pending</span>
                            </div>
                        </div>
                        <div className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">Refund for Order #7712</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium">Ticket #TKT-8845 • Resolved Yesterday</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase tracking-widest">Resolved</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Contact Options Sidebar */}
        <div className="space-y-8">
            
            <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-muted-foreground/60 px-1">Connect with us</h3>
                <div className="grid gap-4">
                    {contactOptions.map((option) => (
                        <div key={option.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-border/50 cursor-pointer">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${option.color}-500/10 text-${option.color}-500`}>
                                <option.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-sm font-bold">{option.title}</p>
                                    <span className={`text-[8px] font-black text-${option.color}-500 uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-${option.color}-500/10`}>
                                        {option.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium truncate">{option.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-2">
                    <button className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                        <MessageSquare className="w-4 h-4" />
                        Start Live Chat
                    </button>
                    <p className="text-center text-[8px] text-muted-foreground mt-3 font-black uppercase tracking-widest opacity-60">Avg. wait time: 2 mins</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-muted-foreground/60 px-1">Resources</h3>
                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between group">
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">Documentation</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                    <button className="w-full flex items-center justify-between group">
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">Community Forum</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                    <button className="w-full flex items-center justify-between group">
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">API Status</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </button>
                </div>
            </div>

        </div>

      </div>

    </div>
  );
};

export default SupportPage;
