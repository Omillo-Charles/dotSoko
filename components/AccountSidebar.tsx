"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Store, 
  Package, 
  ChevronRight, 
  Bell, 
  ShieldCheck, 
  UserCog, 
  LayoutDashboard,
  ShoppingBag,
  Settings,
  HelpCircle,
  X,
  TrendingUp,
  LogOut,
  MapPin,
  CreditCard
} from "lucide-react";
import { GoldCheck } from "./GoldCheck";

type Tab = "account" | "seller";

interface AccountSidebarProps {
  user: any;
  activeTab: Tab;
  activeSection?: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onSectionChange?: (section: any) => void;
  onTabChange?: (tab: Tab) => void;
  onLogoutClick: () => void;
}

export const AccountSidebar = ({
  user,
  activeTab,
  activeSection,
  isSidebarOpen,
  setIsSidebarOpen,
  onSectionChange,
  onTabChange,
  onLogoutClick,
}: AccountSidebarProps) => {
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    if (activeTab === "account") {
      return [
        { id: "overview", label: "Account Overview", icon: UserCog, href: "/account" },
        { id: "orders", label: "My Orders", icon: ShoppingBag, href: "/account/orders" },
        { id: "addresses", label: "Saved Addresses", icon: MapPin, href: "/account/addresses" },
        { id: "payment", label: "Payment Methods", icon: CreditCard, href: "/account/payment" },
        { id: "security", label: "Security & Privacy", icon: ShieldCheck, href: "/account/security" },
        { id: "notifications", label: "Notifications", icon: Bell, href: "/account/notifications" },
        { id: "support", label: "Help & Support", icon: HelpCircle, href: "/account/support" },
      ];
    } else {
      return [
        { id: "overview", label: "Dashboard", icon: TrendingUp, href: "/account/seller" },
        { id: "shop", label: "Products", icon: Store, href: "/account/products" },
        { id: "orders", label: "Order Management", icon: Package, href: "/account/seller-orders" },
        { id: "settings", label: "Shop Settings", icon: Settings, href: "/account/settings" },
      ];
    }
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleSectionClick = (item: any) => {
    if (onSectionChange) {
      onSectionChange(item.id);
      if (isSidebarOpen) setIsSidebarOpen(false);
    }
  };

  return (
    <aside className={`
      fixed inset-0 z-50 lg:sticky lg:top-[128px] lg:block lg:w-72 lg:h-[calc(100vh-160px)] shrink-0
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>
      {/* Mobile Backdrop */}
      <div className={`
        lg:hidden absolute inset-0 bg-primary/5 backdrop-blur-2xl transition-opacity duration-500
        ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
      `} onClick={() => setIsSidebarOpen(false)} />
      
      <div className="relative w-72 lg:w-full h-full bg-background/60 backdrop-blur-3xl border border-white/10 dark:border-white/5 shadow-2xl rounded-[2.5rem] p-6 lg:p-8 pb-32 lg:pb-32 overflow-y-auto custom-scrollbar group/sidebar overscroll-contain">
        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        {/* Background Decorative Circles */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {activeTab === "account" ? <User className="w-6 h-6" /> : <Store className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal</p>
              <h2 className="font-black text-foreground">CONSOLE</h2>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Brief */}
        <div className="mb-10 text-center lg:text-left">
          <div className="relative inline-block lg:block">
            <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto lg:mx-0">
              <div className="w-full h-full rounded-[1.7rem] bg-background grid place-items-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            </div>
            {user?.isPremium && (
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center">
                <GoldCheck className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-foreground">{user?.name}</h3>
            <p className="text-xs text-muted-foreground font-medium truncate">{user?.email}</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1.5 bg-muted/50 rounded-2xl mb-8 border border-border">
          <button 
            onClick={() => handleTabChange("account")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "account" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Buyer
          </button>
          <button 
            onClick={() => handleTabChange("seller")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "seller" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Seller
          </button>
        </div>

        <nav className="space-y-2 mb-10 relative z-10">
          {menuItems.map((item) => {
            const isInternal = !!onSectionChange;
            const isActive = isInternal
              ? activeSection === item.id
              : item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href);

            if (isInternal) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group/item
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 translate-x-1" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                  `}
                >
                  {/* Item Spotlight */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  )}
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover/item:scale-110"}`} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto animate-in fade-in slide-in-from-left-2" />}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group/item
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 translate-x-1" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                `}
              >
                {/* Item Spotlight */}
                {!isActive && (
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                )}
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover/item:scale-110"}`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto animate-in fade-in slide-in-from-left-2" />}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border">
          <button
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};