"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useOrders } from "@/hooks/useOrders";
import { 
  UserCog, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  ShoppingBag,
  Clock,
  ArrowRight,
  Package
} from "lucide-react";
import Link from "next/link";
import { GoldCheck } from "@/components/GoldCheck";

// Force Next.js Fast Refresh
const BuyerDashboard = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: orders = [], isLoading: isOrdersLoading } = useOrders();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isOrdersLoading;

  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o: any) => ['pending', 'processing', 'shipped'].includes(o.status)).length;

  const quickLinks = [
    { label: "My Orders", icon: <ShoppingBag className="w-6 h-6" />, href: "/account/orders", desc: "View and track your previous orders" },
    { label: "Saved Addresses", icon: <MapPin className="w-6 h-6" />, href: "/account/addresses", desc: "Manage your delivery locations" },
    { label: "Payment Methods", icon: <CreditCard className="w-6 h-6" />, href: "/account/payment", desc: "Securely manage your payment options" },
    { label: "Security", icon: <ShieldCheck className="w-6 h-6" />, href: "/account/security", desc: "Update your password and security settings" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="relative group overflow-hidden rounded-[3rem] border border-white/10 dark:border-white/5 bg-background/40 backdrop-blur-3xl shadow-xl p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-1 shadow-2xl">
              <div className="w-full h-full rounded-[2.4rem] bg-background flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-primary/80">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
            {user?.isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-background p-1 rounded-full shadow-lg border border-border">
                <GoldCheck className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Hello, {user?.name}
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              {user?.email}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                <UserCog className="w-4 h-4" />
                Buyer Account
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold border border-blue-500/20">
                <Package className="w-4 h-4" />
                {activeOrdersCount} Active Orders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="group flex items-start gap-5 p-6 rounded-[2rem] bg-background/50 backdrop-blur-3xl border border-white/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {link.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{link.label}</h3>
              <p className="text-sm text-muted-foreground">{link.desc}</p>
            </div>
            <div className="p-3 rounded-full bg-transparent group-hover:bg-primary group-hover:text-white text-muted-foreground transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Mini-View */}
      <div className="bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">Recent Orders</h2>
          <Link href="/account/orders" className="text-primary font-bold text-sm hover:underline">
            View All
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-50 ring-4 ring-white/5">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-bold">No recent orders found.</p>
            <Link href="/shop" className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-white/10">
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">KES {order.totalAmount.toLocaleString()}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                    order.status === 'delivered' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BuyerDashboard;
