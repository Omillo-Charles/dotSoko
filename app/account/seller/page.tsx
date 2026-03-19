"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@/components/dashboard/DashboardComponents";
import { DashboardView } from "./DashboardView";
import { OrdersView } from "./OrdersView";
import { ProductsView } from "./ProductsView";
import { SettingsView } from "./SettingsView";
import { NotificationsView, PaymentsView, SupportView } from "./OtherViews";

const SellerDashboard = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: shop, isLoading: isShopLoading, error: shopError } = useMyShop();
  const { data: products = [], isLoading: isProductsLoading, refetch: refetchProducts } = useMyProducts();
  const { orders = [], isLoading: isOrdersLoading } = useSellerOrders();
  
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "overview";
  const [isMounted, setIsMounted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
              className="mt-10 px-10 py-5 rounded-[2rem] bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-sm tracking-[0.2em]"
            >
              Setup my shop
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

  const renderView = () => {
    switch (currentView) {
      case "overview":
      case "dashboard":
        return <DashboardView user={user} shop={shop} products={products} orders={orders} refetchProducts={refetchProducts} />;
      case "orders":
        return <OrdersView />;
      case "products":
        return <ProductsView />;
      case "settings":
        return <SettingsView />;
      case "notifications":
        return <NotificationsView />;
      case "payment":
        return <PaymentsView />;
      case "support":
        return <SupportView />;
      default:
        return (
          <div className="p-20 text-center bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border">
             <Store className="w-16 h-16 text-primary/20 mx-auto mb-6" />
             <h2 className="text-2xl font-black text-foreground">{currentView} view</h2>
             <p className="text-muted-foreground mt-2">Experimental module initializing...</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1400px]">
        {renderView()}
      </div>
    </div>
  );
};

export default SellerDashboard;
