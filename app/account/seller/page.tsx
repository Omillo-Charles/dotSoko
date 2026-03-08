"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Plus, 
  TrendingUp,
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
import ProductCreateModal from "@/components/ProductCreateModal";
import { CreateUpdateModal } from "@/components/CreateUpdateModal";

const SellerDashboard = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: shop, isLoading: isShopLoading, error: shopError } = useMyShop();
  const { data: products = [], isLoading: isProductsLoading, refetch: refetchProducts } = useMyProducts();
  const { orders = [], isLoading: isOrdersLoading } = useSellerOrders();
  const [isMounted, setIsMounted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

  if (!shop) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4">
        <div className="relative overflow-hidden bg-background p-10 rounded-[2.5rem] border border-border text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-[2rem] grid place-items-center mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3 transform transition-transform hover:rotate-0">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Launch Your Business</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto font-medium">Create your professional shop presence and start reaching millions of customers today.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-8 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
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
    { label: "Add Product", icon: <Plus className="w-5 h-5" />, action: () => setShowProductModal(true), color: "bg-primary text-white shadow-primary/20" },
    { label: "Storefront", icon: <Store className="w-5 h-5" />, href: shop ? `/shop/${shop.username ? `@${shop.username}` : shop._id}` : `/shop/my-shop`, color: "bg-muted text-foreground border border-border" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, href: "/account/seller/settings", color: "bg-muted text-foreground border border-border" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
      {/* Immersive Dashboard Header */}
      <div className="relative group p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
        <div className="relative overflow-hidden rounded-[3rem] border border-border/50 bg-background/40 backdrop-blur-3xl shadow-2xl p-6 md:p-12">
          
          {/* Animated Decorative Blobs */}
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6 md:gap-10">
              {/* Shop Identity */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700" />
                <div className="relative w-20 h-20 md:w-32 md:h-32 p-1.5 rounded-[2.5rem] bg-gradient-to-br from-primary/40 to-secondary/40 backdrop-blur-md shadow-2xl">
                  <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-background border border-white/10">
                    <img
                      src={shop?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${shop?.name || "Shop"}`}
                      alt={shop?.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-background shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Branding and Greeting */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest animate-in fade-in slide-in-from-left duration-700">
                  <Zap className="w-3 h-3 fill-current" />
                  Live Marketplace
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter">
                    {shop?.name || "The dotSoko Shop"}
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm md:text-base font-medium max-w-lg leading-relaxed">
                  Welcome back, <span className="text-foreground font-black">@{user?.name?.toLowerCase().replace(/\s+/g, '') || "merchant"}</span>! Your store status is <span className="text-emerald-500 font-bold">Excellent</span> today.
                </p>
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch gap-4">
              {quickActions.map((action, idx) => (
                action.action ? (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-3 px-6 py-4 rounded-3xl font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-xl ${action.color}`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ) : (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-3 px-6 py-4 rounded-3xl font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-xl ${action.color}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-2">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden bg-background rounded-[2.5rem] border border-border p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${stat.light} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="relative z-10">
              <div className={`w-14 h-14 ${stat.light} ${stat.text} rounded-[1.25rem] flex items-center justify-center mb-6 ring-1 ring-inset ring-white/10`}>
                {stat.icon}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-3xl font-black text-foreground tracking-tight">{stat.value}</h3>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full`} style={{ width: '70%' }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">+12%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 px-2">
        {/* Left Column: Orders */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Recent Orders</h2>
            </div>
            <Link href="/account/seller/orders" className="group flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
              Full Statement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {orders.length === 0 ? (
              <div className="bg-muted/10 border-2 border-dashed border-border p-12 rounded-[2.5rem] text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-bold tracking-tight">Your customers are browsing. No orders yet.</p>
              </div>
            ) : (
              orders.slice(0, 4).map((o) => (
                <div key={o._id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-background rounded-[2rem] border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                      <LayoutDashboard className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-black text-foreground text-lg tracking-tight">Order #{o._id.slice(-6).toUpperCase()}</h4>
                      <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground mt-1">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                        <span>{o.items.length} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:text-right gap-6">
                    <div>
                      <div className="text-xl font-black text-primary">KES {o.totalAmount.toLocaleString()}</div>
                      <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${o.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                        {o.status}
                      </div>
                    </div>
                    <button className="p-3 bg-muted hover:bg-primary hover:text-white rounded-xl transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Inventory */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Hot Inventory</h2>
            <Link href="/account/seller/products" className="text-muted-foreground font-black text-xs uppercase tracking-widest hover:text-primary transition-colors">
              Store Manager
            </Link>
          </div>

          <div className="bg-background rounded-[2.5rem] border border-border p-3 space-y-3">
            {products.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-30">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-muted-foreground text-xs font-bold">No products listed.</p>
              </div>
            ) : (
              products.slice(0, 5).map((p: any) => (
                <Link
                  key={p._id || p.id}
                  href={`/account/seller/products/edit/${p._id || p.id}`}
                  className="flex items-center gap-4 p-3 rounded-[1.5rem] hover:bg-muted/50 transition-all group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden border border-border shrink-0">
                    <img src={p.image || "/placeholder-product.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <h5 className="font-black text-foreground text-sm truncate group-hover:text-primary transition-colors">{p.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-black text-sm">KES {p.price?.toLocaleString?.() || "—"}</span>
                      <span className="text-[10px] font-bold text-muted-foreground/40">{p.category}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                       <ShieldCheck className="w-3 h-3 text-emerald-500" />
                       <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Listing Active</span>
                    </div>
                  </div>
                  <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                </Link>
              ))
            )}
            
            {products.length > 5 && (
              <Link 
                href="/account/seller/products"
                className="block w-full text-center py-4 text-xs font-black text-primary uppercase tracking-widest border-t border-border hover:bg-primary/5 rounded-b-[1.5rem] transition-colors"
              >
                Show all Products ({products.length})
              </Link>
            )}
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-purple-500/20 group">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10 space-y-4">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                 <TrendingUp className="w-6 h-6 text-white" />
               </div>
               <h4 className="text-xl font-black leading-tight tracking-tight">Boost your sales with Updates!</h4>
               <p className="text-white/80 text-sm font-medium leading-relaxed">Sellers who post daily updates see 3x more engagement than those who don't. Start your first story today.</p>
               <button 
                 onClick={() => setShowUpdateModal(true)}
                 className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
               >
                 CREATE STORY
               </button>
             </div>
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

      <CreateUpdateModal 
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />
    </div>
  );
};

export default SellerDashboard;
