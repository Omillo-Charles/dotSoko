"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrderDetails } from "@/hooks/useOrders";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MapPin, 
  Phone, 
  User,
  CreditCard,
  Calendar
} from "lucide-react";
import { calculateShippingFee } from "@/lib/shipping";
import Image from "next/image";
import Link from "next/link";

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock, label: "Pending" },
    processing: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package, label: "Processing" },
    shipped: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck, label: "Shipped" },
    delivered: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2, label: "Delivered" },
    cancelled: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle, label: "Cancelled" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrderDetails(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-border text-center max-w-md w-full">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
          <button 
            onClick={() => router.back()}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="h-16 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-accent rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Order Details</h1>
            <p className="text-xs text-muted-foreground font-medium">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="py-6 space-y-6">
        {/* Status Card */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Order Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1 md:text-right">
              <p className="text-sm text-muted-foreground font-medium">Placed on</p>
              <div className="flex items-center md:justify-end gap-1.5 text-foreground font-semibold">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-accent/30">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Order Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item._id} className="p-6 flex gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-accent flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Qty: {item.quantity} × KES {item.price.toLocaleString()}
                      </p>
                      {(item.size || item.color) && (
                        <div className="flex gap-2 mt-2">
                          {item.size && (
                            <span className="px-2 py-0.5 bg-accent rounded text-[10px] font-bold text-muted-foreground uppercase">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="px-2 py-0.5 bg-accent rounded text-[10px] font-bold text-muted-foreground uppercase">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-accent/20 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="text-foreground font-semibold">
                    KES {(() => {
                      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      return subtotal.toLocaleString();
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className={(() => {
                    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const shippingFee = order.shippingFee ?? calculateShippingFee(subtotal);
                    return shippingFee <= 0;
                  })() ? "text-green-600 dark:text-green-400 font-bold" : "text-foreground font-semibold"}>
                    {(() => {
                      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      const shippingFee = order.shippingFee ?? calculateShippingFee(subtotal);
                      return shippingFee <= 0 ? "FREE" : `KES ${shippingFee.toLocaleString()}`;
                    })()}
                  </span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-xl font-black text-primary">KES {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Section */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border space-y-4">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Recipient</p>
                    <p className="text-sm font-bold text-foreground">{order.shippingAddress.name}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-bold text-foreground">{order.shippingAddress.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Address</p>
                    <p className="text-sm font-bold text-foreground leading-relaxed">
                      {order.shippingAddress.street},<br />
                      {order.shippingAddress.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border space-y-4">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Method</p>
                  <p className="text-sm font-bold text-foreground">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Status</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
