"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  Settings 
} from "lucide-react";

const navItems = [
  { icon: <BarChart3 className="w-5 h-5" />, label: "Overview", href: "/account/seller" },
  { icon: <ShoppingBag className="w-5 h-5" />, label: "Products", href: "/account/seller/products" },
  { icon: <Package className="w-5 h-5" />, label: "Orders", href: "/account/seller/orders" },
  { icon: <Users className="w-5 h-5" />, label: "Customers", href: "/account/seller/customers" },
  { icon: <TrendingUp className="w-5 h-5" />, label: "Analytics", href: "/account/seller/analytics" },
  { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/account/seller/settings" },
];

export const SellerNav = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-[80px] lg:top-[128px] z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Scrollable Container with Fade Effect Indicators */}
        <div className="relative group/nav">
          {/* Left Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-opacity" />
          
          <div className="flex items-center gap-2 h-14 md:h-20 overflow-x-auto scrollbar-hide scroll-smooth py-1 flex-nowrap">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative shrink-0 group flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-black tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isActive
                      ? "text-primary bg-primary/5 shadow-sm"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {/* Active Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
                  )}
                  
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  
                  <span className="relative z-10 uppercase tracking-widest text-[11px]">
                    {item.label}
                  </span>

                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-500" />
                  )}
                  
                  {/* Hover Indicator Line */}
                  {!isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-foreground/20 group-hover:w-full transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-opacity" />
        </div>
      </div>
    </nav>
  );
};
