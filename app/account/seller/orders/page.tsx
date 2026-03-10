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

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusIcons = {
  pending: Clock,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrdersPage() {
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
        <h1 className="text-3xl font-black text-foreground tracking-tight">System Interrupt</h1>
        <p className="text-muted-foreground mt-4 font-medium text-lg leading-relaxed">We encountered an anomaly while synchronizing your shop's ledger.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-10 px-10 py-5 rounded-[2rem] bg-foreground text-background font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
        >
          Re-initialize Synch
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
            href="/account/seller" 
            className="p-4 hover:bg-background/60 backdrop-blur-3xl rounded-3xl transition-all text-muted-foreground hover:text-foreground border border-border shadow-sm dark:border-border/50 shadow-xl group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">Your Orders</h1>
            <p className="text-muted-foreground font-medium text-lg">Detailed transaction history and delivery logistics.</p>
          </div>
        </div>
        <div className="bg-background/40 backdrop-blur-3xl border border-border shadow-sm px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-baseline gap-3">
          <span className="text-4xl font-black text-primary leading-none">{orders.length}</span>
          <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Total Transactions</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-background/20 backdrop-blur-3xl border-2 border-dashed border-border shadow-sm rounded-[4rem] p-24 text-center shadow-2xl group transition-all hover:bg-white/[0.02] hover:border-border">
          <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 ring-4 ring-white/5">
            <Package className="w-12 h-12 text-muted-foreground/20" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">Ledger Empty</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium text-lg leading-relaxed">
            Market activity will manifest here once customers initiate purchase protocols.
          </p>
          <Link 
            href="/account" 
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
          >
            Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shippingFee = order.shippingFee ?? calculateShippingFee(subtotal);
            
            return (
              <div 
                key={order._id}
                className="group relative overflow-hidden bg-background/40 backdrop-blur-3xl rounded-[3.5rem] border border-border shadow-sm transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:border-primary/20"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
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
                          <h4 className="text-2xl font-black text-foreground tracking-tighter italic uppercase underline decoration-primary/50 underline-offset-8 decoration-4">
                            TRX-{order._id.slice(-8).toUpperCase()}
                          </h4>
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                           <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4" />
                             {new Date(order.createdAt).toLocaleDateString()}
                           </div>
                           <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                           <div className="flex items-center gap-2">
                             <UserIcon className="w-4 h-4" />
                             {order.user.name}
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-50">Transaction Total</p>
                         <h3 className="text-4xl font-black text-primary tracking-tighter italic leading-none">
                           KES {order.totalAmount.toLocaleString()}
                         </h3>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-6">
                      <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 italic">Unit Breakdown</h5>
                      <div className="grid gap-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl bg-background/30 border border-border/50 hover:bg-white/5 transition-colors group/item">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-muted overflow-hidden border border-border shadow-sm shrink-0 shadow-lg relative">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-black/20" />
                                </div>
                              )}
                              <div className="absolute top-0 right-0 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-bl-xl text-[10px] font-black text-primary italic">
                                x{item.quantity}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-black text-foreground text-lg tracking-tight truncate leading-tight italic">{item.name}</p>
                               <div className="flex items-center gap-4 mt-2">
                                 <span className="text-primary font-black text-sm italic">KES {item.price.toLocaleString()}</span>
                                 <div className="flex items-center gap-2 flex-wrap">
                                   {item.size && <span className="text-[9px] font-black text-muted-foreground/50 uppercase border border-border shadow-sm px-2 py-0.5 rounded-md">Size: {item.size}</span>}
                                   {item.color && <span className="text-[9px] font-black text-muted-foreground/50 uppercase border border-border shadow-sm px-2 py-0.5 rounded-md">Hex: {item.color}</span>}
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
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Operational Subtotal</p>
                          <p className="font-black text-foreground italic">KES {subtotal.toLocaleString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Logistics Manifest</p>
                          <p className="font-black text-foreground italic">KES {shippingFee.toLocaleString()}</p>
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
                         <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Logistics Hub</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                          <div className="space-y-1">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-50">Base of Delivery</p>
                            <p className="text-sm font-black text-foreground leading-tight italic">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                          <div className="space-y-1">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-50">Comm Protocol</p>
                            <p className="text-sm font-black text-foreground italic">{order.shippingAddress.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Governance Cluster */}
                    <div className="space-y-6 pt-6 border-t border-border/50">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Status Governance</p>
                         <div className="relative group/sel">
                           <select 
                             value={order.status}
                             onChange={(e) => updateStatus({ orderId: order._id, status: e.target.value })}
                             disabled={isUpdating}
                             className="w-full px-6 py-4 rounded-2xl bg-background shadow-2xl border border-border shadow-sm text-foreground font-black text-xs uppercase tracking-widest appearance-none focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer disabled:opacity-50"
                           >
                             {statuses.map(s => (
                               <option key={s} value={s} className="capitalize">{s}</option>
                             ))}
                           </select>
                           <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary rotate-90 pointer-events-none group-hover/sel:scale-125 transition-transform" />
                         </div>
                         <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter opacity-30 px-2 italic">
                           Updating status triggers user notification protocols.
                         </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Link 
                          href={`/account/orders/${order._id}`}
                          className="flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Full Insight
                        </Link>
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
}
