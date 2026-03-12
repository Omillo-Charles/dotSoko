"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Package, 
  Star, 
  Settings, 
  Search, 
  Trash2, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  MoreVertical,
  SlidersHorizontal,
  Mail,
  Smartphone,
  ChevronRight
} from "lucide-react";

const SellerNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const notifications = [
    {
      id: "1",
      type: "order",
      title: "New Order Received!",
      message: "Customer Jane Doe placed an order #SOKO-9021 for 'Wireless Headphones'.",
      time: "10 mins ago",
      isRead: false,
      icon: Package,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      id: "2",
      type: "review",
      title: "5-Star Review Received",
      message: "John Smith reviewed your product 'Smart Watch'. 'Excellent quality and fast shipping!'",
      time: "2 hours ago",
      isRead: false,
      icon: Star,
      color: "text-amber-500 bg-amber-500/10"
    },
    {
      id: "3",
      type: "system",
      title: "Platform Update",
      message: "We've introducing a new analytics dashboard for sellers. Check it out now.",
      time: "Yesterday",
      isRead: true,
      icon: AlertCircle,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      id: "4",
      type: "message",
      title: "New Customer Inquiry",
      message: "Alice asked a question regarding the warranty on your 'Gaming Mouse'.",
      time: "2 days ago",
      isRead: true,
      icon: MessageSquare,
      color: "text-purple-500 bg-purple-500/10"
    }
  ];

  const tabs = [
    { id: "all", label: "All Alerts" },
    { id: "order", label: "Orders" },
    { id: "review", label: "Reviews" },
    { id: "message", label: "Messages" },
    { id: "system", label: "System" }
  ];

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1 relative">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Shop Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-black rounded-full shadow-lg shadow-primary/30">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <p className="text-muted-foreground font-medium text-base">Stay on top of your shop's latest activities.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="p-3 bg-muted/50 hover:bg-muted text-foreground rounded-2xl transition-all border border-border shadow-sm">
                <Search className="w-5 h-5" />
            </button>
            <button className="p-3 bg-muted/50 hover:bg-muted text-foreground rounded-2xl transition-all border border-border shadow-sm">
                <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                <CheckCircle2 className="w-4 h-4" />
                Mark all read
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Notifications List */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-muted/30 backdrop-blur-md rounded-[1.5rem] border border-border w-fit shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                    <div 
                        key={notification.id}
                        className={`group relative overflow-hidden bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2rem] p-6 transition-all duration-500 hover:bg-white/5 hover:shadow-xl hover:border-primary/30 ${!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                    >
                        <div className="flex items-start gap-5 md:gap-6 relative z-10">
                            <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 ${notification.color} shadow-sm border border-border/50`}>
                                <notification.icon className="w-6 h-6 shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start md:items-center justify-between gap-2 md:gap-4 mb-2 flex-col md:flex-row">
                                    <h4 className="text-lg font-black text-foreground tracking-tight truncate flex-1 uppercase">
                                        {notification.title}
                                    </h4>
                                    <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest bg-muted/40 px-3 py-1 rounded-lg shrink-0 border border-border/50">
                                        {notification.time}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed group-hover:text-foreground/90 transition-colors pr-2 md:pr-8">
                                    {notification.message}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button className="p-2 text-muted-foreground/30 hover:text-foreground hover:bg-background rounded-full transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Decorative hover effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    </div>
                ))}

                {filteredNotifications.length === 0 && (
                    <div className="text-center py-24 bg-background/30 backdrop-blur-2xl border border-dashed border-border shadow-sm rounded-[3rem]">
                        <div className="w-20 h-20 bg-muted/50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-muted-foreground shadow-sm">
                            <Bell className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">You're all caught up!</h3>
                        <p className="text-muted-foreground text-sm font-medium px-4">There are no new shop alerts matching this category.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Settings Panel for Sellers */}
        <div className="space-y-6">
            
            <div className="bg-gradient-to-br from-background/40 to-muted/20 backdrop-blur-3xl border border-border shadow-md rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                {/* Decorative blob */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-[2s]" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Notification Preferences</h3>
                </div>

                <div className="space-y-6 relative z-10 pt-2">
                    <div className="flex items-center justify-between p-3 -mx-3 rounded-2xl hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-background shadow-sm rounded-xl">
                                <Mail className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-foreground">Email Summary</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Receive daily sales report</p>
                            </div>
                        </div>
                        {/* Custom Toggle UI */}
                        <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer shadow-inner">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 -mx-3 rounded-2xl hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-background shadow-sm rounded-xl">
                                <Smartphone className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-foreground">Push Notifications</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Real-time order alerts</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer shadow-inner">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 -mx-3 rounded-2xl hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-background shadow-sm rounded-xl">
                                <AlertCircle className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-foreground">Stock Alerts</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">When inventory runs low</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-muted rounded-full relative p-1 cursor-pointer shadow-inner">
                            <div className="w-4 h-4 bg-background shadow-sm rounded-full absolute left-1" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border mt-6 relative z-10 flex justify-between items-center group/link cursor-pointer">
                    <span className="text-[11px] font-black text-primary uppercase tracking-widest group-hover/link:underline">
                        Manage Full Settings
                    </span>
                    <ChevronRight className="w-4 h-4 text-primary transition-transform group-hover/link:translate-x-1" />
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2.5rem] p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Inbox Management</h3>
                </div>
                <p className="text-sm text-foreground/70 font-medium leading-relaxed">
                    Instantly clear old or read alerts to maintain a pristine dashboard.
                </p>
                <button className="w-full flex items-center justify-center gap-3 py-4 border border-red-500/30 text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/20">
                    <Trash2 className="w-4 h-4" />
                    Clear Read Alerts
                </button>
            </div>

        </div>

      </div>

    </div>
  );
};

export default SellerNotificationsPage;
