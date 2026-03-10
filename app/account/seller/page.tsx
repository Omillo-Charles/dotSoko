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
  ArrowRight, 
  ExternalLink, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  LayoutDashboard
} from "lucide-react";

import { useUser } from "@/hooks/useUser";
import { useMyShop } from "@/hooks/useShop";
import { useMyProducts } from "@/hooks/useProducts";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { RegisterShopModal } from "@/components/RegisterShopModal";
import { ProductCreateModal } from "@/components/ProductCreateModal";
import { SellerAnalytics } from "@/components/SellerAnalytics";


// Force Next.js Fast Refresh
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
        <div className="relative overflow-hidden bg-background/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 dark:border-white/5 text-center shadow-2xl">
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

  const activeOrders = orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length;
  
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
    { label: "Active Orders", value: activeOrders.toString(), icon: <Package className="w-6 h-6" />, color: "bg-blue-500", light: "bg-blue-500/10", text: "text-blue-500" },
    { label: "Inventory", value: products.length.toString(), icon: <ShoppingBag className="w-6 h-6" />, color: "bg-purple-500", light: "bg-purple-500/10", text: "text-purple-500" },
    { label: "Performance", value: "98%", icon: <Zap className="w-6 h-6" />, color: "bg-amber-500", light: "bg-amber-500/10", text: "text-amber-500" },
  ];

  const quickActions = [
    { label: "Add Product", icon: <Plus className="w-5 h-5" />, action: () => setShowProductModal(true), color: "bg-primary text-primary-foreground shadow-xl shadow-primary/20" },
    { label: "Storefront", icon: <Store className="w-5 h-5" />, href: `/shop/${shop.username ? `@${shop.username}` : shop._id}`, color: "bg-background/80 backdrop-blur-md text-foreground border border-white/10 shadow-xl" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, href: "/account/settings", color: "bg-background/80 backdrop-blur-md text-foreground border border-white/10 shadow-xl" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Dashboard Header */}
      <div className="relative group p-0.5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative overflow-hidden rounded-[3.5rem] border border-white/10 dark:border-white/5 bg-background/40 backdrop-blur-3xl shadow-2xl p-8 md:p-14">
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-6 md:gap-12">
              {/* Shop Identity */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-700" />
                <div className="relative w-24 h-24 md:w-40 md:h-40 p-2 rounded-[3rem] bg-gradient-to-br from-primary/50 to-secondary/50 backdrop-blur-md shadow-2xl">
                  <div className="w-full h-full rounded-[2.6rem] overflow-hidden bg-background border border-white/20 dark:border-white/5">
                    <img
                      src={shop?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${shop?.name || "Shop"}`}
                      alt={shop?.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-background shadow-2xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div> 

              {/* Branding and Greeting */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Live Marketplace
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">
                  {shop?.name}
                </h1>
                <p className="text-muted-foreground text-base md:text-xl font-medium max-w-xl leading-relaxed">
                  Welcome back, <span className="text-foreground font-black italic">@{user?.name?.toLowerCase().replace(/\s+/g, '')}</span>. Your store activity is <span className="text-emerald-500 font-bold">surging</span> today.
                </p>
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="flex flex-wrap items-stretch gap-4">
              {quickActions.map((action, idx) => (
                action.action ? (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-2xl ${action.color}`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ) : (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-2xl ${action.color}`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 dark:border-white/5 p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
          >
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${stat.light} blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            <div className="relative z-10">
              <div className={`w-16 h-16 ${stat.light} ${stat.text} rounded-[1.5rem] flex items-center justify-center mb-8 ring-1 ring-white/10 shadow-lg`}>
                {stat.icon}
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-[12px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
                <h3 className="text-4xl font-black text-foreground tracking-tight">{stat.value}</h3>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-2 flex-1 bg-muted/50 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]`} style={{ width: '70%' }} />
                </div>
                <span className="text-xs font-black text-muted-foreground">+12.5%</span>
              </div>
            </div>
          </div>
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
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Recent Activity</h2>
            </div>
            <Link href="/account/seller-orders" className="group flex items-center gap-2.5 text-primary font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all">
              Live Ledger
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-5">
            {orders.length === 0 ? (
              <div className="bg-background/20 border-2 border-dashed border-white/10 p-20 rounded-[3.5rem] text-center space-y-6">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-white/5">
                  <Clock className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-lg font-bold tracking-tight">Listening for customer activity...</p>
              </div>
            ) : (
              orders.slice(0, 5).map((o) => (
                <div key={o._id} className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 gap-8">
                  <div className="flex items-center gap-8 flex-1 min-w-0">
                    <div className="w-24 h-24 bg-muted/50 rounded-[1.8rem] flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors duration-500 shrink-0">
                      <LayoutDashboard className="w-10 h-10 text-primary/30 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-foreground text-2xl tracking-tighter leading-none italic uppercase truncate group-hover:text-primary transition-colors duration-500">TRX-{o._id.slice(-6)}</h4>
                      <div className="flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-widest mt-3 opacity-60">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                        <span>{o.items.length} Units</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:text-right gap-8">
                    <div>
                      <div className="text-2xl font-black text-primary tracking-tighter italic">KES {o.totalAmount.toLocaleString()}</div>
                      <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${o.status === 'delivered' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'} animate-pulse`} />
                        {o.status}
                      </div>
                    </div>
                    <Link href={`/account/seller-orders`} className="p-4 bg-background/60 hover:bg-primary hover:text-primary-foreground rounded-2xl transition-all duration-500 shadow-lg border border-border">
                      <ChevronRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Storefront Pulse */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Storefront Pulse</h2>
            </div>
            <Link href="/account/products" className="group flex items-center gap-2.5 text-primary font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all">
              Inventory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-5">
              {products.length === 0 ? (
                <div className="bg-background/20 border-2 border-dashed border-white/10 p-20 rounded-[3.5rem] text-center space-y-6">
                  <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-white/5">
                    <Package className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground text-sm font-black uppercase tracking-widest">Digital Shelf Empty</p>
                </div>
              ) : (
                products.slice(0, 5).map((p: any) => (
                  <div
                    key={p._id || p.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 gap-8"
                   >
                    <div className="flex items-center gap-8 flex-1 min-w-0">
                      <div className="w-24 h-24 rounded-[1.8rem] bg-muted overflow-hidden border border-white/10 shrink-0 shadow-lg">
                        <img src={p.image || "/placeholder-product.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-black text-foreground text-2xl tracking-tighter italic truncate group-hover:text-primary transition-colors duration-500">{p.name}</h5>
                        <div className="flex items-center gap-2 mt-3 opacity-60">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">High Velocity</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:text-right gap-8">
                       <div>
                        <div className="text-2xl font-black text-primary tracking-tighter italic">KES {p.price?.toLocaleString?.() || "—"}</div>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse" />
                          Listed
                        </div>
                      </div>
                      <Link href={`/account/products`} className="p-4 bg-background/60 hover:bg-primary hover:text-primary-foreground rounded-2xl transition-all duration-500 shadow-lg border border-border">
                        <ChevronRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
              
              {products.length > 5 && (
                <Link 
                  href="/account/products"
                  className="block w-full text-center py-6 text-xs font-black text-primary uppercase tracking-[0.3em] hover:bg-primary/5 rounded-[2.5rem] transition-all duration-500 border border-white/10"
                >
                  Expand Vault ({products.length})
                </Link>
              )}
            </div>
          </div>
        </div>

        <ProductCreateModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onCreated={() => {
            setShowProductModal(false);
            refetchProducts();
          }}
          shopName={shop?.name}
        />
      </div>
    );
};

export default SellerDashboard;
