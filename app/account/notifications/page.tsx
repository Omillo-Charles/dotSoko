"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Package, 
  Tag, 
  ShieldCheck, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Settings,
  Mail,
  Smartphone,
  ChevronRight,
  MoreVertical
} from "lucide-react";

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const notifications = [
    {
      id: "1",
      type: "order",
      title: "Order Delivered",
      message: "Your package from Gadget Store has been delivered successfully.",
      time: "2 hours ago",
      isRead: false,
      icon: Package,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      id: "2",
      type: "offer",
      title: "New Flash Sale!",
      message: "Get up to 50% off on all accessories for the next 4 hours.",
      time: "5 hours ago",
      isRead: true,
      icon: Tag,
      color: "text-orange-500 bg-orange-500/10"
    },
    {
      id: "3",
      type: "security",
      title: "Account Login",
      message: "New login detected from a Safari browser on macOS.",
      time: "Yesterday",
      isRead: true,
      icon: ShieldCheck,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      id: "4",
      type: "order",
      title: "Order Confirmed",
      message: "Your order #SOKO-8921 has been confirmed and is being processed.",
      time: "2 days ago",
      isRead: true,
      icon: Package,
      color: "text-emerald-500 bg-emerald-500/10"
    }
  ];

  const tabs = [
    { id: "all", label: "All" },
    { id: "orders", label: "Orders" },
    { id: "offers", label: "Offers" },
    { id: "security", label: "Security" }
  ];

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(n => n.type === activeTab.slice(0, -1));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase leading-none underline decoration-primary/30 underline-offset-8">Notifications</h1>
          <p className="text-muted-foreground font-medium text-base">Stay updated with your latest alerts and activities.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-3 bg-muted/50 hover:bg-muted text-muted-foreground rounded-2xl transition-all border border-border">
                <Search className="w-5 h-5" />
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
            <div className="flex gap-2 p-1.5 bg-muted/50 backdrop-blur-md rounded-2xl border border-border w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                    <div 
                        key={notification.id}
                        className={`group relative overflow-hidden bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2rem] p-6 transition-all duration-500 hover:bg-white/5 hover:border-primary/30 ${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
                    >
                        <div className="flex items-start gap-6 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notification.color}`}>
                                <notification.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h4 className="text-lg font-black text-foreground tracking-tight italic truncate group-hover:not-italic transition-all uppercase">
                                        {notification.title}
                                    </h4>
                                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md">
                                        {notification.time}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed group-hover:text-foreground/80 transition-colors">
                                    {notification.message}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="p-2 text-muted-foreground/30 hover:text-foreground transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {/* Decorative background element on hover */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/2" />
                    </div>
                ))}

                {filteredNotifications.length === 0 && (
                    <div className="text-center py-20 bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[3rem]">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Bell className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic mb-1">No alerts found</h3>
                        <p className="text-muted-foreground text-sm font-medium">Clear skies! You have no notifications in this category.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
            
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Preferences</h3>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-foreground">Email Notifications</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Daily summary of activity</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-foreground">Push Alerts</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Instant real-time updates</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-muted rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-primary/10 relative z-10">
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                        Advanced Security Settings
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Notification Cleaning */}
            <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm rounded-[2.5rem] p-8 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-muted-foreground/60">Archive Protocol</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Auto-delete notifications older than 30 days to keep your console clean and fast.
                </p>
                <button className="w-full flex items-center justify-center gap-3 py-4 border border-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                    Purge All Read
                </button>
            </div>

        </div>

      </div>

    </div>
  );
};

export default NotificationsPage;
