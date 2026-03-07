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
    <nav className="bg-background border-b border-border sticky top-[80px] lg:top-[128px] z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 h-12 md:h-16 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
