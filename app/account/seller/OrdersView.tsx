"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  User as UserIcon,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  DollarSign,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useSellerOrders } from '@/hooks/useSellerOrders';
import { calculateShippingFee } from '@/lib/shipping';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const OrdersView = () => {
  const { orders, isLoading, error, updateStatus, isUpdating } = useSellerOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin-slow"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 ring-1 ring-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">System interrupt</h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg leading-relaxed">We encountered an anomaly while synchronizing your shop's ledger.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-10 px-10 py-5 rounded-[2rem] bg-foreground text-background font-black text-sm   transition-all shadow-2xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/account/seller?view=overview" 
            className="p-4 backdrop-blur-3xl rounded-3xl transition-all text-muted-foreground border border-border shadow-sm dark:border-border/50 shadow-xl"
          >
            <ArrowLeft className="w-6 h-6 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">Your orders</h1>
            <p className="text-muted-foreground font-medium text-lg">Detailed transaction history and delivery logistics.</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-background/20 backdrop-blur-3xl border-2 border-dashed border-border shadow-sm rounded-[4rem] p-24 text-center shadow-2xl transition-all">
          <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 ring-4 ring-white/5">
            <Package className="w-12 h-12 text-muted-foreground/20" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">No orders found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium text-lg leading-relaxed">
            Market activity will appear here once customers start making purchases.
          </p>
          <Link 
            href="/account/seller?view=overview" 
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-[2.5rem] font-black text-sm  transition-all shadow-2xl shadow-primary/30"
          >
            Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            const subtotal = order.items?.reduce((sum, item: any) => sum + (item.price * item.quantity), 0) || 0;
            const shippingFee = order.shippingFee ?? calculateShippingFee(subtotal);
            
            return (
              <div 
                key={order._id}
                className="relative overflow-hidden bg-background/40 backdrop-blur-3xl rounded-[3.5rem] border border-border shadow-sm transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] transition-opacity duration-1000" />
                
                {/* Visual Connector */}
                <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-primary'} opacity-20`} />

                {/* Grid Container */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px]">
                  
                  {/* Content Area */}
                  <div className="p-8 md:p-12 space-y-10 border-r border-border/50">
                    
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-foreground tracking-tighter underline decoration-primary/50 underline-offset-8 decoration-4">
                            TRX-{order._id.slice(-8)}
                          </h4>
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border ${statusColors[order.status]}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 text-[11px] font-black text-muted-foreground opacity-60">
                           <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4" />
                             {new Date(order.createdAt).toLocaleDateString()}
                           </div>
                           <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                           <div className="flex items-center gap-2">
                             {order.user?.name || "Unknown"}
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-muted-foreground mb-1 opacity-50">Transaction Total</p>
                         <h3 className="text-4xl font-black text-primary tracking-tighter leading-none">
                           KES {order.totalAmount?.toLocaleString() || 0}
                         </h3>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-6">
                      <h5 className="text-[11px] font-black text-muted-foreground opacity-40">Unit breakdown</h5>
                      <div className="grid gap-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl bg-background/30 border border-border/50 transition-colors">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-muted overflow-hidden border border-border shadow-sm shrink-0 shadow-lg relative">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-black/20" />
                                </div>
                              )}
                              <div className="absolute top-0 right-0 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-bl-xl text-[10px] font-black text-primary">
                                x{item.quantity}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-black text-foreground text-lg tracking-tight truncate leading-tight">{item.name}</p>
                               <div className="flex items-center gap-4 mt-2">
                                 <span className="text-primary font-black text-sm">KES {item.price.toLocaleString()}</span>
                                 <div className="flex items-center gap-2 flex-wrap">
                                   {item.size && <span className="text-[9px] font-black text-muted-foreground/50 border border-border shadow-sm px-2 py-0.5 rounded-md">Size: {item.size}</span>}
                                   {item.color && <span className="text-[9px] font-black text-muted-foreground/50 border border-border shadow-sm px-2 py-0.5 rounded-md">Hex: {item.color}</span>}
                                 </div>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary Overlay */}
                    <div className="pt-8 border-t border-border/50 flex flex-wrap gap-10">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground opacity-50">Operational subtotal</p>
                          <p className="font-black text-foreground">KES {subtotal.toLocaleString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground opacity-50">Logistics manifest</p>
                          <p className="font-black text-foreground">KES {shippingFee.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>

                  {/* Sidebar/Actions */}
                  <div className="p-8 md:p-12 bg-black/[0.1] backdrop-blur-md space-y-10">
                    
                    {/* Shipping Cluster */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-border shadow-sm">
                            <Truck className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <h3 className="text-sm font-black text-white">Logistics hub</h3>
                       </div>
                       <div className="space-y-6">
                         <div className="flex gap-4">
                           <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                           <div className="space-y-1">
                             <p className="text-xs font-black text-muted-foreground opacity-50">Delivery address</p>
                              <p className="text-sm font-black text-foreground leading-tight">{order.shippingAddress?.street || "N/A"}, {order.shippingAddress?.city || ""}</p>
                           </div>
                         </div>
                         <div className="flex gap-4">
                           <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                           <div className="space-y-1">
                             <p className="text-xs font-black text-muted-foreground opacity-50">Contact info</p>
                              <p className="text-sm font-black text-foreground">{order.shippingAddress?.phone || "N/A"}</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Governance Cluster */}
                    <div className="space-y-6 pt-6 border-t border-border/50">
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-muted-foreground opacity-40">Status</p>
                          <div className="relative">
                            <select 
                              value={order.status}
                              onChange={(e) => updateStatus({ orderId: order._id, status: e.target.value })}
                              disabled={isUpdating}
                              className="w-full px-6 py-4 rounded-2xl bg-background shadow-2xl border border-border shadow-sm text-foreground font-black text-xs appearance-none focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {statuses.map(s => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                              ))}
                            </select>
                            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary rotate-90 pointer-events-none transition-transform" />
                          </div>
                          <p className="text-[9px] text-muted-foreground font-black tracking-tighter opacity-30 px-2">
                            Updating status sends a notification to the customer.
                          </p>
                       </div>
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
