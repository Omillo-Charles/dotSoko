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
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const OrdersPage = () => {
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
        <p className="text-muted-foreground font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to load orders</h2>
        <p className="text-muted-foreground mb-6">There was an error fetching your order history. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          You haven't placed any orders yet. When you do, they'll show up here.
        </p>
        <Link 
          href="/shop" 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:py-8 pb-28 lg:pb-8">
      <div className="mb-6">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </Link>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track your recent orders</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order: any) => (
          <div 
            key={order._id}
            className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            {/* Order Header */}
            <div className="p-4 md:p-6 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Order Date</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                  <p className="text-sm font-mono text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${getStatusStyles(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                      <Image 
                        src={item.image || "/placeholder-product.png"} 
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Footer */}
            <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground italic">
                Payment: <span className="font-bold text-foreground">{order.paymentMethod}</span>
              </p>
              <Link 
                href={`/account/orders/${order._id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group-hover:translate-x-1 transition-transform"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Need help with an order?</h4>
            <p className="text-sm text-muted-foreground">Contact our support team for any issues or questions.</p>
          </div>
        </div>
        <Link 
          href="/contact"
          className="bg-foreground text-background px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all shrink-0"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default OrdersPage;
