"use client";

import React, { useState } from "react";
import { 
  Search, 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  ArrowLeft,
  Calendar,
  Phone,
  HelpCircle,
  XCircle,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedId = orderId.trim().replace(/^#/, "");
    if (!trimmedId) return;
    
    setIsSearching(true);
    setError(null);
    setOrder(null);

    console.log(`Tracking order: ${trimmedId}`);
    console.log(`API Base URL: ${api.defaults.baseURL}`);

    try {
      const response = await api.get(`/orders/track/${encodeURIComponent(trimmedId)}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError(response.data.message || "Order not found");
      }
    } catch (err: any) {
      console.error("Tracking error - Full Error Object:", err);
      console.error("Tracking error - Response Data:", err.response?.data);
      
      const message = err.response?.data?.message || err.friendlyMessage || "Could not find an order with that ID. Please check the ID and try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusSteps = (currentStatus: string, createdAt: string, updatedAt: string) => {
    const allStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    const statusLabels: Record<string, string> = {
      pending: 'Order Placed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };

    const currentIndex = allStatuses.indexOf(currentStatus);
    
    return allStatuses.map((status, index) => {
      const isCompleted = index <= currentIndex;
      const isCurrent = index === currentIndex;
      
      let date = "Pending";
      let time = "-";
      
      if (status === 'pending') {
        date = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        time = new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (isCompleted && status === currentStatus) {
        date = new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        time = new Date(updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }

      return {
        status: statusLabels[status],
        date,
        time,
        completed: isCompleted && !isCurrent,
        current: isCurrent
      };
    });
  };

  return (
    <main className="min-h-screen bg-muted/30 pb-24 lg:pb-12">
      {/* Header */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-8 py-4 md:py-8">
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shopping
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Track Your Order
            </h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Enter your order ID to see real-time updates on your package's journey 
              from the shop to your doorstep.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 mt-8 md:-mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tracking Form Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-background border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <form onSubmit={handleTrack} className="relative">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Enter Order ID (e.g. #29257B or full ID)"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-foreground"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 ml-1 font-medium">
                      Enter the 6-character code from your email (e.g. #29257B) or the full 24-character ID.
                    </p>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px] h-[58px]"
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      "Track Order"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {order && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Order Status Card */}
                <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 md:p-8 bg-foreground text-background">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Current Status</p>
                        <h2 className="text-2xl font-black flex items-center gap-2">
                          <Truck className="w-6 h-6 text-primary" />
                          <span className="capitalize">{order.status}</span>
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Order Date</p>
                        <p className="text-xl font-black">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase">Order ID</p>
                          <p className="text-sm font-black text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase">Destination</p>
                          <p className="text-sm font-black text-foreground">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase">Items</p>
                          <p className="text-sm font-black text-foreground">{order.items.length} product(s)</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-0 relative">
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
                      {getStatusSteps(order.status, order.createdAt, order.updatedAt).map((step, idx) => (
                        <div key={idx} className="relative pl-12 pb-10 last:pb-0 group">
                          <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center z-10 transition-colors ${
                            step.completed ? 'bg-primary text-primary-foreground' : 
                            step.current ? 'bg-background border-primary text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className={`w-2 h-2 rounded-full ${step.current ? 'bg-primary animate-pulse' : 'bg-current'}`} />}
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <div>
                              <p className={`font-black text-sm ${step.current ? 'text-primary' : 'text-foreground'}`}>{step.status}</p>
                              <p className="text-xs text-muted-foreground font-medium md:hidden">{step.date} · {step.time}</p>
                            </div>
                            <p className="hidden md:block text-xs text-muted-foreground font-bold">{step.date} · {step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-12 pt-12 border-t border-border">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-6">Order Items</h3>
                      <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-foreground truncate">{item.name}</p>
                              <p className="text-xs font-bold text-muted-foreground mt-1">Sold by {item.shopName}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-black text-foreground">KES {item.price.toLocaleString()}</p>
                              <p className="text-xs font-bold text-muted-foreground mt-1">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-sm font-bold text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-black text-primary">KES {order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-red-900 dark:text-red-400 mb-2">Order Not Found</h3>
                <p className="text-sm text-red-700 dark:text-red-400/80 mb-6 max-w-sm mx-auto">
                  {error}
                </p>
                <button 
                  onClick={() => {
                    setError(null);
                    setOrderId("");
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!order && !error && !isSearching && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-background border border-border rounded-3xl">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Where is my Order ID?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You can find your Order ID in the confirmation email we sent you, 
                    or by visiting the 'Orders' section in your account dashboard.
                  </p>
                </div>
                <div className="p-6 bg-background border border-border rounded-3xl">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If you're having trouble tracking your package, please contact 
                    our 24/7 support team at <a href="mailto:support@dotsoko.com" className="text-primary hover:underline">support@dotsoko.com</a>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Download Our App</h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
                  Get real-time push notifications about your order status and track 
                  your package on the go with the <span className="text-secondary">.</span>Soko mobile app.
                </p>
                <div className="space-y-3">
                  <a 
                    href="https://apps.apple.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-background text-foreground rounded-xl font-bold text-sm hover:bg-muted transition-colors text-center"
                  >
                    App Store
                  </a>
                  <a 
                    href="https://play.google.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-background/10 text-primary-foreground border border-background/20 rounded-xl font-bold text-sm hover:bg-background/20 transition-colors text-center"
                  >
                    Google Play
                  </a>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-background/10 rounded-full blur-2xl" />
            </div>

            <div className="bg-background border border-border rounded-3xl p-6">
              <h4 className="font-black text-foreground text-sm mb-4 uppercase tracking-wider">Quick Support</h4>
              <div className="space-y-4">
                {[
                  { name: 'Shipping Policy', href: '/help' },
                  { name: 'Refund Policy', href: '/returns' },
                  { name: 'FAQs', href: '/help' },
                ].map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors font-bold group"
                  >
                    {item.name}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TrackOrderPage;
