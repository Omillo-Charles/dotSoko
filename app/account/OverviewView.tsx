"use client";

import React from "react";
import { 
  UserCog, 
  ShoppingBag,
  Clock,
  Package,
  MapPin,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { 
  DashboardShell, 
  DashboardHeader, 
  DashboardStatCard, 
  DashboardSection, 
  DashboardListCard 
} from "@/components/dashboard/DashboardComponents";

interface OverviewViewProps {
  user: any;
  orders: any[];
}

export const OverviewView = ({ user, orders }: OverviewViewProps) => {
  const activeOrdersCount = orders.filter((o: any) => ['pending', 'processing', 'shipped'].includes(o.status)).length;

  const quickLinks = [
    { label: "My Orders", icon: <ShoppingBag className="w-6 h-6" />, href: "/account?view=orders", desc: "View and track your previous orders" },
    { label: "Saved Addresses", icon: <MapPin className="w-6 h-6" />, href: "/account?view=addresses", desc: "Manage your delivery locations" },
    { label: "Payment Methods", icon: <CreditCard className="w-6 h-6" />, href: "/account?view=payment", desc: "Securely manage your payment options" },
    { label: "Security", icon: <ShieldCheck className="w-6 h-6" />, href: "/account?view=security", desc: "Update your password and security settings" },
  ];

  return (
    <DashboardShell>
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
            <p className="text-muted-foreground font-medium">{user?.email}</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold border border-blue-500/20 shadow-sm">
                <Package className="w-4 h-4" />
                {activeOrdersCount} Active Orders
              </span>
            </div>
          </div>
        }
      />

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

      <DashboardSection 
        title="Recent Orders" 
        icon={<ShoppingBag className="w-6 h-6 text-primary" />}
        action={{ label: "View All", href: "/account?view=orders" }}
      >
        {orders.length === 0 ? (
          <div className="py-16 text-center space-y-6 bg-background/20 backdrop-blur-3xl rounded-[3rem] border border-border/50 shadow-2xl">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-50 ring-4 ring-white/5">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
               <p className="text-foreground text-xl font-black tracking-tight">No recent orders</p>
               <p className="text-muted-foreground font-medium max-w-xs mx-auto">Your order history is currently empty. Start exploring the shop.</p>
            </div>
            <Link href="/shop" className="inline-block mt-4 px-10 py-4 bg-primary text-white rounded-[1.5rem] font-black tracking-widest text-xs transition-all shadow-xl shadow-primary/30">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {orders.slice(0, 3).map((order: any) => (
              <DashboardListCard
                key={order._id}
                id={order._id}
                title={`Order #${order._id.slice(-6)}`}
                subtitle={new Date(order.createdAt).toLocaleDateString()}
                image={order.items?.[0]?.image}
                amount={`KES ${order.totalAmount.toLocaleString()}`}
                status={order.status}
                statusVariant={order.status === 'delivered' ? 'success' : 'warning'}
                href={`/account/orders/${order._id}`}
                icon={<ShoppingBag className="w-10 h-10" />}
              />
            ))}
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  );
};
