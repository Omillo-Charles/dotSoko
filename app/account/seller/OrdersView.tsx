"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
  MapPin,
  Phone,
} from 'lucide-react';
import { useSellerOrders } from '@/hooks/useSellerOrders';

const STATUS_CONFIG: Record<string, { label: string; icon: any; stripe: string; badge: string }> = {
  pending:    { label: 'Pending',    icon: Clock,        stripe: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  processing: { label: 'Processing', icon: Loader2,      stripe: 'bg-blue-500',    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  shipped:    { label: 'Shipped',    icon: Truck,        stripe: 'bg-purple-500',  badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  delivered:  { label: 'Delivered',  icon: CheckCircle2, stripe: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      stripe: 'bg-red-500',     badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' },
};

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const OrdersView = () => {
  const { orders, isLoading, error, updateStatus, isUpdating } = useSellerOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Failed to load orders.</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/account/seller?view=overview"
          className="p-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border rounded-3xl">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-semibold text-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">Orders from your shop will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const total = order.totalAmount?.toLocaleString() || 0;
            const itemCount = order.items?.length || 0;
            const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div
                key={order._id}
                className="flex overflow-hidden bg-background border border-border rounded-2xl"
              >
                {/* Status stripe */}
                <div className={`w-1.5 shrink-0 ${cfg.stripe}`} />

                {/* Main content */}
                <div className="flex-1 p-5 space-y-4">

                  {/* Top row: ID + status badge + total */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-foreground text-sm truncate">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.badge}`}>
                        <StatusIcon className={`w-3 h-3 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <span className="font-bold text-primary text-base">KES {total}</span>
                  </div>

                  {/* Meta row: date · customer · items */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>{date}</span>
                    {order.user?.name && <span className="font-medium text-foreground">{order.user.name}</span>}
                    <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Delivery info */}
                  {order.shippingAddress && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {order.shippingAddress.street && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {order.shippingAddress.street}, {order.shippingAddress.city}
                        </span>
                      )}
                      {order.shippingAddress.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {order.shippingAddress.phone}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Items list (compact) */}
                  {order.items && order.items.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border text-xs">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-5 h-5 rounded object-cover shrink-0" />
                          )}
                          <span className="font-medium text-foreground truncate max-w-[120px]">{item.name}</span>
                          <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status update */}
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-xs text-muted-foreground font-medium shrink-0">Update status:</label>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus({ orderId: order._id, status: e.target.value })}
                        disabled={isUpdating}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 cursor-pointer"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

