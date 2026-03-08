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
  Settings
} from "lucide-react";

import { useUser } from "@/hooks/useUser";
import { useMyShop } from "@/hooks/useShop";
import { useMyProducts } from "@/hooks/useProducts";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { RegisterShopModal } from "@/components/RegisterShopModal";
import ProductCreateModal from "@/components/ProductCreateModal";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-background p-8 rounded-2xl border border-border text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl grid place-items-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Create Your Shop</h2>
          <p className="text-sm text-muted-foreground mt-2">You don’t have a shop yet. Create one to access seller tools.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Create Shop
          </button>
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
    { label: "Total Sales", value: `KES ${totalSales.toLocaleString()}`, icon: <BarChart3 className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Active Orders", value: activeOrders.toString(), icon: <Package className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-600" },
    { label: "Total Products", value: products.length.toString(), icon: <ShoppingBag className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-600" },
    { label: "Store Visits", value: "0", icon: <TrendingUp className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-600" },
  ];

  const quickActions = [
    { label: "Add Product", icon: <Plus className="w-5 h-5" />, action: () => setShowProductModal(true), color: "bg-primary text-primary-foreground" },
    { label: "View Store", icon: <Store className="w-5 h-5" />, href: shop ? `/shop/${shop.username ? `@${shop.username}` : shop._id}` : `/shop/my-shop`, color: "bg-muted text-foreground" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, href: "/account/seller/settings", color: "bg-muted text-foreground" },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header/Navbar */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-xl shadow-primary/5">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-secondary/15 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-2xl" />
        </div>

        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />

        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Shop Info Section */}
            <div className="flex items-center gap-5">
              {/* Shop Avatar with Glow Effect */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-primary via-primary/50 to-secondary blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary p-[2px] shadow-2xl shadow-primary/20">
                  <div className="w-full h-full rounded-[1.4rem] bg-background overflow-hidden ring-2 ring-background">
                    <img
                      src={shop?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${shop?.name || "Shop"}`}
                      alt={shop?.name || "Shop avatar"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                {/* Online Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-background shadow-lg">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground leading-none tracking-tight">
                    {isMounted ? (shop?.name || "Store Overview") : "Store Overview"}
                  </h2>
                  {shop?.isVerified && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">
                    Welcome back, <span className="font-bold text-foreground">{isMounted ? (user?.name || "User") : "User"}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                      Seller
                    </span>
                    {user?.isPremium && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-wider">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-stretch gap-3 w-full lg:w-auto">
              {quickActions.map((action, idx) => 
                action.action ? (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`group relative px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full sm:w-auto overflow-hidden ${action.color}`}
                  >
                    {/* Button Glow Effect */}
                    {idx === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                    <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                      {action.icon}
                    </span>
                    <span className="relative z-10 hidden sm:inline font-black tracking-wide">
                      {action.label}
                    </span>
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    )}
                  </button>
                ) : (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`group relative px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full sm:w-auto ${action.color}`}
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      {action.icon}
                    </span>
                    <span className="hidden sm:inline font-black tracking-wide">
                      {action.label}
                    </span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all hover:shadow-lg hover:border-primary/30"
          >
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-primary/10 blur-2xl" />
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent Orders</h3>
              <p className="text-[11px] font-bold text-muted-foreground">Latest five orders</p>
            </div>
            <Link href="/account/seller/orders" className="text-primary font-bold text-sm hover:underline">
              View All
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <div key={o._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center border border-border">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">#{o._id.slice(-6)}</div>
                      <div className="text-[11px] font-bold text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-black text-primary">KES {o.totalAmount.toLocaleString()}</div>
                    <div className="text-[11px] font-bold text-muted-foreground capitalize">{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent Products</h3>
              <p className="text-[11px] font-bold text-muted-foreground">Latest six items</p>
            </div>
            <Link href="/account/seller/products" className="text-primary font-bold text-sm hover:underline">
              Manage
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No products yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.slice(0, 6).map((p: any) => (
                <Link
                  key={p._id || p.id}
                  href={`/account/seller/products/edit/${p._id || p.id}`}
                  className="group rounded-[1.25rem] overflow-hidden border border-border hover:border-primary/30 transition-all bg-muted/30 w-full"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img src={p.image || "/placeholder-product.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{p.name}</div>
                    <div className="text-[11px] font-black text-primary mt-1">KES {p.price?.toLocaleString?.() || "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Create Modal */}
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
