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
  Package
} from "lucide-react";
import Link from "next/link";
import { 
  DashboardShell, 
  DashboardHeader, 
  DashboardStatCard, 
  DashboardSection, 
  DashboardListCard 
} from "@/components/dashboard/DashboardComponents";

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
    <DashboardShell>
      {/* Profile Header */}
      <DashboardHeader
        image="/defaultAvatar.jpeg"
        isPremium={user?.isPremium}
        statusBadge={{
          label: "Buyer Account",
          icon: <UserCog className="w-3.5 h-3.5" />
        }}
        title={<>Hello, {user?.name}</>}
        subtitle={
          <div className="space-y-4">
            <p>{user?.email}</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold border border-blue-500/20">
                <Package className="w-4 h-4" />
                {activeOrdersCount} Active Orders
              </span>
            </div>
          </div>
        }
      />

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link, idx) => (
          <DashboardStatCard
            key={idx}
            label={link.label}
            icon={link.icon}
            desc={link.desc}
            href={link.href}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <DashboardSection 
        title="Recent Orders" 
        icon={<ShoppingBag className="w-6 h-6 text-primary" />}
        action={{ label: "View All", href: "/account/orders" }}
      >
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
              <DashboardListCard
                key={order._id}
                id={order._id}
                title={`Order #${order._id.slice(-6).toUpperCase()}`}
                subtitle={new Date(order.createdAt).toLocaleDateString()}
                amount={`KES ${order.totalAmount.toLocaleString()}`}
                status={order.status}
                statusVariant={order.status === 'delivered' ? 'success' : 'warning'}
                href={`/account/orders/${order._id}`}
                icon={<ShoppingBag className="w-6 h-6" />}
              />
            ))}
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  );
};

export default BuyerDashboard;
