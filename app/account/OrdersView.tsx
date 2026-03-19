"use client";

import React from "react";
import { useOrders } from "@/hooks/useOrders";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  ShoppingBag,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const OrdersView = () => {
  const { data: orders, isLoading, error } = useOrders();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'shipped': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-900/30';
    }
  };

  const formatPrice = (price: number) => {
    return `KES ${price?.toLocaleString() || 0}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-black text-sm uppercase tracking-widest">Syncing orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20 shadow-xl">
          <XCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">System Error</h2>
        <p className="text-muted-foreground mb-8 font-medium max-w-xs mx-auto text-sm leading-relaxed">Failed to synchronize your order history. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-foreground text-background px-8 py-3 rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link 
            href="/account?view=overview" 
            className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-border group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Orders</h1>
            <p className="text-muted-foreground text-sm font-medium">Track and manage your previous purchases.</p>
          </div>
        </div>
        <div className="bg-primary/5 text-primary px-5 py-2 rounded-full border border-primary/10 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
          <span>{orders?.length || 0} Orders total</span>
        </div>
      </div>

      <div className="space-y-6">
        {!orders || orders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-background/20 backdrop-blur-3xl rounded-3xl border border-dashed border-border transition-all">
             <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto" />
             <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">No orders yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium">Your order history will appear here once you make a purchase.</p>
             </div>
             <Link 
               href="/shop"
               className="inline-block px-8 py-3 bg-foreground text-background rounded-full font-bold text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
             >
               Start Shopping
             </Link>
          </div>
        ) : (
          orders.map((order: any) => (
            <div 
              key={order._id}
              className="bg-background/40 backdrop-blur-3xl border border-border rounded-3xl overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-8 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                    <p className="font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-mono text-muted-foreground/50 text-xs tracking-tighter">#{order._id.slice(-8)}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold shadow-sm ${getStatusStyles(order.status)}`}>
                  <div className="scale-90">{getStatusIcon(order.status)}</div>
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>

              {/* Items */}
              <div className="p-6 space-y-6">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 group/item">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                      <Image 
                        src={item.image || "/placeholder-product.png"} 
                        alt={item.name || "Product"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-foreground line-clamp-1 truncate transition-colors group-hover/item:text-primary">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                       {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted/5 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Paid via <span className="text-foreground">{order.paymentMethod}</span>
                 </div>
                 <Link 
                    href={`/account/orders/${order._id}`}
                    className="text-[10px] font-bold text-primary hover:underline underline-offset-4 uppercase tracking-widest flex items-center gap-2"
                 >
                    Order Details
                    <ChevronRight className="w-3 h-3" />
                 </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight">Need assistance?</h4>
          <p className="text-muted-foreground text-sm font-medium mt-1">Our support team is always here for your order questions.</p>
        </div>
        <Link 
          href="/contact"
          className="bg-foreground text-background px-8 py-3.5 rounded-full font-bold text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};
