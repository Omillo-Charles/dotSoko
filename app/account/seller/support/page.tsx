"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Phone, 
  ArrowRight, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  BarChart3,
  ArrowLeft,
  LifeBuoy,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

const SellerSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      id: "1",
      category: "Payouts & Collections",
      icon: CreditCard,
      questions: [
        "How do I update my payout method?",
        "When will I receive my earnings?",
        "How do I set up a Direct Collection Till?"
      ]
    },
    {
      id: "2",
      category: "Product Management",
      icon: Store,
      questions: [
        "Why is my product pending approval?",
        "How many products can I list?",
        "Guidelines for high-quality product images"
      ]
    },
    {
      id: "3",
      category: "Analytics & Growth",
      icon: BarChart3,
      questions: [
        "How to interpret Market Pulse data?",
        "Tips for increasing shop followers",
        "Understanding conversion rates"
      ]
    },
    {
      id: "4",
      category: "Account & Security",
      icon: ShieldCheck,
      questions: [
        "How to secure my merchant account?",
        "Updating my shop profile details",
        "Permission levels for shop staff"
      ]
    }
  ];

  const tickets = [
    { id: "TKT-5521", subject: "Product Approval Delay", status: "Active", date: "2024-03-09" },
    { id: "TKT-5490", subject: "Payout Verification", status: "Resolved", date: "2024-03-05" }
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
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">Merchant Support</h1>
            <p className="text-muted-foreground font-medium text-lg">Priority assistance and merchant documentation.</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative group overflow-hidden rounded-[3.5rem] bg-background/60 backdrop-blur-3xl border border-border shadow-2xl p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-black text-foreground tracking-tight">How can we help your business today?</h2>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search seller documentation, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border shadow-sm rounded-[2rem] pl-16 pr-8 py-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trending:</span>
            {["Payout Policy", "Image Guidelines", "Marketplace Fees"].map((tag) => (
              <button key={tag} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">{tag}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* FAQ Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((category) => (
              <div 
                key={category.id}
                className="group p-8 bg-background/60 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight italic uppercase">{category.category}</h3>
                </div>
                <ul className="space-y-4">
                  {category.questions.map((q, i) => (
                    <li key={i}>
                      <button className="flex items-center justify-between w-full text-left group/q">
                        <span className="text-sm font-bold text-muted-foreground group-hover/q:text-foreground transition-colors">{q}</span>
                        <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover/q:opacity-100 transition-all transform translate-x-2 group-hover/q:translate-x-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Active Support Requests */}
          <div className="p-8 bg-background/60 backdrop-blur-3xl rounded-[3rem] border border-border shadow-sm space-y-8">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Active Requests</h2>
               </div>
               <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">View History</button>
            </div>

            <div className="grid gap-4">
               {tickets.map((ticket) => (
                 <div key={ticket.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-muted/20 rounded-3xl border border-border/50 hover:bg-muted/40 transition-colors gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase italic tracking-tight">{ticket.subject}</h4>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{ticket.id} • {ticket.date}</p>
                       </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      ticket.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {ticket.status}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Support Channels Sidebar */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <LifeBuoy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">Contact Hub</h3>
          </div>

          <div className="grid gap-5">
            {[
              { label: "Merchant Success Chat", sub: "Live Response: ~5 min", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Verification Desk", sub: "Priority Email Support", icon: Mail, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Merchant Hotline", sub: "Mon-Sat, 8am-8pm", icon: Phone, color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((channel, i) => (
              <button 
                key={i}
                className="group flex items-center gap-6 p-6 bg-background/60 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all text-left"
              >
                <div className={`w-14 h-14 rounded-2xl ${channel.bg} ${channel.color} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                  <channel.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-foreground text-lg tracking-tight leading-none italic">{channel.label}</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{channel.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Resources */}
          <div className="p-8 bg-black/[0.05] dark:bg-white/[0.02] backdrop-blur-md rounded-[3rem] border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                 <BookOpen className="w-5 h-5 text-primary" />
               </div>
               <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] italic">Merchant Assets</h4>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Seller Handbook", size: "2.4 MB" },
                { title: "Marketplace Fee Matrix", size: "0.8 MB" },
                { title: "API Integration Guide", size: "1.2 MB" }
              ].map((res, i) => (
                <Link key={i} href="#" className="flex items-center justify-between group/link p-2 hover:bg-white/[0.05] rounded-xl transition-all">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors">{res.title}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-50">PDF • {res.size}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors translate-x-1" />
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-border/50">
               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[1.8rem] p-6 flex flex-col items-center text-center space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Platform Status</p>
                  </div>
                  <p className="text-sm font-black text-foreground">Operational</p>
                  <p className="text-[9px] text-muted-foreground font-medium">All merchant services are running at optimal velocity.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerSupportPage;
