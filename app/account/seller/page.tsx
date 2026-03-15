"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

import { useUser } from "@/hooks/useUser";
import { useMyShop } from "@/hooks/useShop";
import { useMyProducts } from "@/hooks/useProducts";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { RegisterShopModal } from "@/components/modals/RegisterShopModal";
import { ProductCreateModal } from "@/components/modals/ProductCreateModal";
import { SellerAnalytics } from "@/components/dashboard/SellerAnalytics";
import { MarketInsights } from "@/components/dashboard/MarketInsights";
import { 
  DashboardShell, 
  DashboardHeader, 
  DashboardStatCard, 
  DashboardSection, 
  DashboardListCard 
} from "@/components/dashboard/DashboardComponents";

const SellerDashboard = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: shop, isLoading: isShopLoading, error: shopError } = useMyShop();
  const { data: products = [], isLoading: isProductsLoading, refetch: refetchProducts } = useMyProducts();
  const { orders = [], isLoading: isOrdersLoading } = useSellerOrders();
  const [isMounted, setIsMounted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      router.push("/auth?mode=login");
      return;
    }

    if (!isShopLoading && !shop && !shopError) {
      setCreateOpen(true);
    }
  }, [user, isUserLoading, shop, isShopLoading, shopError, router]);

  const isLoading = isUserLoading || isShopLoading || isProductsLoading || isOrdersLoading;

  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin-slow"></div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4">
        <div className="relative overflow-hidden bg-background/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-border shadow-sm dark:border-border/50 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] grid place-items-center mx-auto mb-8 shadow-2xl shadow-primary/30 rotate-3 transform transition-transform hover:rotate-0 duration-700">
              <Store className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-foreground tracking-tight">Launch Your Business</h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto font-medium text-lg leading-relaxed">Create your professional shop presence and start reaching customers today with enterprise-grade tools.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-10 px-10 py-5 rounded-[2rem] bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
            >
              Setup My Shop
            </button>
          </div>
        </div>
        <RegisterShopModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  const activeOrdersCount = orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length;
  
  const totalSales = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((acc, order) => {
      const shopItemsTotal = order.items
        .filter(item => item.shop === shop?._id || (typeof item.shop === 'object' && (item.shop as any)._id === shop?._id))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    { label: "Settings", icon: <Settings className="w-5 h-5" />, href: "/account/seller/settings", color: "bg-background/80 backdrop-blur-md text-foreground border border-border shadow-sm shadow-xl" },
  ];

  return (
    <DashboardShell>
      {/* Premium Dashboard Header */}
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
            Welcome back, <span className="text-foreground font-black italic">@{user?.name?.toLowerCase().replace(/\s+/g, '')}</span>. Your store activity is <span className="text-emerald-500 font-bold">surging</span> today.
          </p>
        }
        actions={quickActions}
      />

      {/* Metrics Section */}
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

      {/* Analytics Insights */}
      <SellerAnalytics 
        orders={orders} 
        products={products} 
        shopId={shop._id} 
      />

      {/* Main Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Recent Activity */}
        <DashboardSection
          title="Recent Activity"
          icon={<Package className="w-6 h-6 text-primary" />}
          action={{ label: "Live Ledger", href: "/account/seller/orders" }}
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
                  title={`TRX-${o._id.slice(-6).toUpperCase()}`}
                  subtitle={`${new Date(o.createdAt).toLocaleDateString()} • ${o.items.length} Units`}
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

        {/* Right Column: Storefront Pulse */}
        <DashboardSection
          title="Storefront Pulse"
          icon={<ShoppingBag className="w-6 h-6 text-primary" />}
          action={{ label: "Inventory", href: "/account/seller/products" }}
        >
          <div className="grid gap-5">
            {products.length === 0 ? (
              <div className="bg-background/20 border-2 border-dashed border-border shadow-sm p-20 rounded-[3.5rem] text-center space-y-6">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-white/5">
                  <Package className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm font-black uppercase tracking-widest">Digital Shelf Empty</p>
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
            
            {products.length > 2 && (
              <Link 
                href="/account/seller/products"
                className="block w-full text-center py-6 text-xs font-black text-primary uppercase tracking-[0.3em] hover:bg-primary/5 rounded-[2.5rem] transition-all duration-500 border border-border shadow-sm"
              >
                Expand Vault ({products.length})
              </Link>
            )}
          </div>
        </DashboardSection>
      </div>

      {/* Market Ecosystem Insights */}
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

export default SellerDashboard;
