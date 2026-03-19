"use client";

import React, { useState } from "react";
import { 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Plus, 
  Store, 
  Settings, 
  Zap, 
  Clock, 
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { SellerAnalytics } from "@/components/dashboard/SellerAnalytics";
import { MarketInsights } from "@/components/dashboard/MarketInsights";
import { 
  DashboardShell, 
  DashboardHeader, 
  DashboardStatCard, 
  DashboardSection, 
  DashboardListCard 
} from "@/components/dashboard/DashboardComponents";
import { ProductCreateModal } from "@/components/modals/ProductCreateModal";

interface DashboardViewProps {
  user: any;
  shop: any;
  products: any[];
  orders: any[];
  refetchProducts: () => void;
}

export const DashboardView = ({ user, shop, products, orders, refetchProducts }: DashboardViewProps) => {
  const [showProductModal, setShowProductModal] = useState(false);

  if (!shop) return null;

  const activeOrdersCount = orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length;
  
  const totalSales = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((acc: number, order: any) => {
      const shopItemsTotal = order.items
        .filter((item: any) => item.shop === shop?._id || (typeof item.shop === 'object' && (item.shop as any)._id === shop?._id))
        .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      return acc + shopItemsTotal;
    }, 0);

  const stats = [
    { label: "Earnings", value: `KES ${totalSales.toLocaleString()}`, icon: <BarChart3 className="w-6 h-6" />, color: "bg-emerald-500", light: "bg-emerald-500/10", text: "text-emerald-500" },
    { label: "Active Orders", value: activeOrdersCount.toString(), icon: <Package className="w-6 h-6" />, color: "bg-blue-500", light: "bg-blue-500/10", text: "text-blue-500" },
    { label: "Inventory", value: products.length.toString(), icon: <ShoppingBag className="w-6 h-6" />, color: "bg-purple-500", light: "bg-purple-500/10", text: "text-purple-500" },
    { label: "Performance", value: "98%", icon: <Zap className="w-6 h-6" />, color: "bg-amber-500", light: "bg-amber-500/10", text: "text-amber-500" },
  ];

  const quickActions = [
    { label: "Add Product", icon: <Plus className="w-5 h-5" />, onClick: () => setShowProductModal(true), color: "bg-primary text-primary-foreground shadow-xl shadow-primary/20" },
    { label: "Storefront", icon: <Store className="w-5 h-5" />, href: `/shop/${shop.username ? `@${shop.username}` : shop._id}`, color: "bg-background/80 backdrop-blur-md text-foreground border border-border shadow-sm shadow-xl" },
  ];

  return (
    <DashboardShell>
      <DashboardHeader
        image={shop?.avatar || '/defaultAvatar.jpeg'}
        statusBadge={{
          label: "Live Marketplace",
          icon: <Zap className="w-3.5 h-3.5 fill-current" />,
          className: "animate-pulse"
        }}
        title={shop?.name}
        subtitle={
          <p>
            Welcome back, <span className="text-foreground font-black">@{user?.name?.toLowerCase().replace(/\s+/g, '')}</span>. Your store activity is <span className="text-emerald-500 font-bold">surging</span> today.
          </p>
        }
        actions={quickActions}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <DashboardStatCard
            key={idx}
            {...stat}
            trend="+12.5%"
            progress={70}
          />
        ))}
      </div>

      <SellerAnalytics 
        orders={orders} 
        products={products} 
        shopId={shop._id} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <DashboardSection
          title="Recent Activity"
          icon={<Package className="w-6 h-6 text-primary" />}
        >
          <div className="grid gap-5">
            {orders.length === 0 ? (
              <div className="bg-background/20 border-2 border-dashed border-border shadow-sm p-20 rounded-[3.5rem] text-center space-y-6">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-white/5">
                  <Clock className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-lg font-bold tracking-tight">Listening for customer activity...</p>
              </div>
            ) : (
              orders.slice(0, 2).map((o: any) => (
                <DashboardListCard
                  key={o._id}
                  id={o._id}
                  title={`TRX-${o._id.slice(-6)}`}
                  subtitle={`${new Date(o.createdAt).toLocaleDateString()} • ${o.items.length} Units`}
                  image={o.items?.[0]?.image}
                  amount={`KES ${o.totalAmount.toLocaleString()}`}
                  status={o.status}
                  statusVariant={o.status === 'delivered' ? 'success' : 'warning'}
                  href={`/account/seller/orders`}
                  icon={<LayoutDashboard className="w-10 h-10" />}
                />
              ))
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Storefront Pulse"
          icon={<ShoppingBag className="w-6 h-6 text-primary" />}
        >
          <div className="grid gap-5">
            {products.length === 0 ? (
              <div className="bg-background/20 border-2 border-dashed border-border shadow-sm p-20 rounded-[3.5rem] text-center space-y-6">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-white/5">
                  <Package className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm font-black">No products found</p>
              </div>
            ) : (
              products.slice(0, 2).map((p: any) => (
                <DashboardListCard
                  key={p._id || p.id}
                  id={p._id || p.id}
                  title={p.name}
                  subtitle="High Velocity"
                  image={p.image || "/placeholder-product.png"}
                  amount={`KES ${p.price?.toLocaleString?.() || "—"}`}
                  status="Listed"
                  statusVariant="success"
                  href={`/account/seller/products`}
                />
              ))
            )}
          </div>
        </DashboardSection>
      </div>

      <MarketInsights />

      <ProductCreateModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onCreated={() => {
          setShowProductModal(false);
          refetchProducts();
        }}
        shopName={shop?.name}
      />
    </DashboardShell>
  );
};
