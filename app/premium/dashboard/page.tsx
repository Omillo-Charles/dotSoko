"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Filter,
  Download,
  MoreVertical,
  Zap,
  Crown,
  Target,
  Globe,
  MessageSquare,
  Search,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Bell,
  LayoutDashboard,
  Settings,
  PieChart,
  Activity,
  Layers,
  Store,
  MapPin,
  LogOut,
  ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useMyProducts } from "@/hooks/useProducts";
import { useMyShop } from "@/hooks/useShop";
import { RegisterShopModal } from "@/components/RegisterShopModal";
import ProductCreateModal from "@/components/ProductCreateModal";
import { useQueryClient } from "@tanstack/react-query";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function PremiumDashboard() {
  const router = useRouter();
  const { user, isLoading: userLoading, logout } = useUser();
  const { data: shop, isLoading: shopLoading, error: shopError } = useMyShop();
  const { orders = [], isLoading: ordersLoading } = useSellerOrders();
  const { data: products = [], isLoading: productsLoading } = useMyProducts();
  const queryClient = useQueryClient();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab ] = useState('overview');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth?mode=login");
      return;
    }

    if (user && !user.isPremium) {
      router.push("/premium");
      return;
    }

    if (user && user.accountType !== "seller") {
      router.push("/account");
      return;
    }

    if (!shopLoading && !shop && !shopError) {
      setShowRegisterModal(true);
    }
  }, [user, userLoading, shop, shopLoading, shopError, router]);

  // Calculate metrics
  const totalRevenue = useMemo(() => {
    if (!shop?._id) return 0;
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, order) => {
        const shopItemsTotal = order.items
          .filter(item => item.shop === shop._id || (typeof item.shop === 'object' && (item.shop as any)._id === shop._id))
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return acc + shopItemsTotal;
      }, 0);
  }, [orders, shop?._id]);

  const activeOrdersCount = useMemo(() => 
    orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length
  , [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  // Group revenue by day for the last 7 days
  const revenueData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dayName: days[d.getDay()],
        dateStr: d.toDateString(),
        revenue: 0
      };
    });

    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      const orderDate = new Date(order.createdAt).toDateString();
      const dayIndex = last7Days.findIndex(d => d.dateStr === orderDate);
      if (dayIndex !== -1) {
        const shopItemsTotal = order.items
          .filter(item => item.shop === shop?._id || (typeof item.shop === 'object' && (item.shop as any)._id === shop?._id))
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        last7Days[dayIndex].revenue += shopItemsTotal;
      }
    });

    return {
      categories: last7Days.map(d => d.dayName),
      series: last7Days.map(d => d.revenue)
    };
  }, [orders, shop?._id]);

  const toggleAccountType = async () => {
    const newType = "buyer";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1";
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${apiUrl}/users/update-account-type`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ accountType: newType }),
      });

      if (!response.ok) throw new Error("Failed to switch account type");

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.data));
      router.push("/account");
    } catch (error) {
      console.error("Error switching account:", error);
      alert("Failed to switch account type. Please try again.");
    }
  };

  // Calculate category distribution
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    products.forEach((p: any) => {
      const cat = p.category || 'Other';
      stats[cat] = (stats[cat] || 0) + 1;
    });

    const labels = Object.keys(stats).slice(0, 5); // Top 5
    const series = labels.map(l => stats[l]);
    
    return { labels, series };
  }, [products]);

  // ApexCharts Configurations
  const salesChartOptions: any = {
    chart: {
      id: "revenue-chart",
      toolbar: { show: false },
      fontFamily: 'inherit',
      background: 'transparent',
    },
    colors: ["#f59e0b", "#6366f1"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    xaxis: {
      categories: revenueData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
          fontWeight: 700,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
          fontWeight: 700,
        },
        formatter: (val: number) => `K${(val / 1000).toFixed(0)}k`
      }
    },
    grid: {
      borderColor: "rgba(148, 163, 184, 0.1)",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      x: { show: false },
    },
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  const salesChartSeries = [
    {
      name: "Revenue",
      data: revenueData.series
    }
  ];

  const categoryChartOptions: any = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    labels: categoryStats.labels.length > 0 ? categoryStats.labels : ['No Products'],
    colors: ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#8b5cf6'],
    legend: {
      position: 'bottom',
      fontSize: '10px',
      fontWeight: 700,
      labels: { colors: '#94a3b8' },
      markers: { radius: 12 }
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'TOTAL PRODUCTS',
              fontSize: '10px',
              fontWeight: 900,
              color: '#94a3b8',
              formatter: () => products.length.toString()
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 900,
              color: 'currentColor'
            }
          }
        }
      }
    }
  };

  const categoryChartSeries = categoryStats.series.length > 0 ? categoryStats.series : [1];

  if (!mounted) return null;

  if (userLoading || shopLoading || ordersLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 rounded-full animate-spin border-t-amber-500"></div>
          <Crown className="absolute inset-0 m-auto w-6 h-6 text-amber-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-amber-500/30 transition-colors duration-500">
      <RegisterShopModal 
        isOpen={showRegisterModal}
        onClose={() => router.push("/account")}
        onSuccess={() => window.location.reload()}
      />
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 dark:bg-amber-500/[0.05] blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/[0.05] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Sleek Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-[128px] h-[calc(100vh-128px)] flex-col items-center w-20 py-8 border-r border-border bg-background/50 backdrop-blur-xl z-50">
          <Link href="/account/seller" className="mb-12 group flex-shrink-0">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <Crown className="w-7 h-7 text-black" />
            </div>
          </Link>
          
          <nav className="flex flex-col gap-6 flex-1">
            {[
              { icon: LayoutDashboard, id: 'overview' },
              { icon: Activity, id: 'analytics' },
              { icon: ShoppingBag, id: 'orders' },
              { icon: Users, id: 'customers' },
              { icon: Layers, id: 'inventory' },
              { icon: Settings, id: 'settings' },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-3 rounded-xl transition-all duration-300 group relative ${
                  activeTab === item.id 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border">
                  {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <button 
              onClick={toggleAccountType}
              className="p-3 text-muted-foreground hover:text-amber-500 transition-colors group relative"
            >
              <ArrowLeftRight className="w-6 h-6" />
              <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border">
                Switch to Buyer
              </div>
            </button>
            <button className="p-3 text-muted-foreground hover:text-amber-500 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <button 
              onClick={() => logout()}
              className="p-3 text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 lg:ml-20 pb-24 lg:pb-8">
          {/* Header Section */}
          <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/30 backdrop-blur-md sticky top-[80px] lg:top-[128px] z-40">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
                Dashboard 
                <span className="text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 uppercase tracking-widest">Premium</span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Quick search..."
                  className="bg-muted border-none rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-amber-500/20 transition-all text-foreground placeholder:text-muted-foreground/50 font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black truncate max-w-[120px] text-foreground">{user?.name || 'Store Owner'}</p>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Premium Seller</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-amber-500/10">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              </div>
            </div>
          </header>

          <div className="py-8 px-0 sm:px-8">
            {activeTab === 'overview' && (
              <>
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, trend: "+12.5%", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Active Orders", value: activeOrdersCount, trend: `+${activeOrdersCount}`, icon: ShoppingBag, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { label: "Total Products", value: products.length, trend: "+2", icon: Layers, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Shop Views", value: "2,842", trend: "+18%", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border rounded-3xl p-6 hover:border-amber-500/30 transition-all duration-300 shadow-sm group">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                          {stat.trend}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                  {/* Revenue Analytics Chart */}
                  <div className="lg:col-span-8 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-foreground">Revenue Overview</h3>
                        <p className="text-xs text-muted-foreground font-bold">Performance over the last 7 days</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-amber-500 text-black text-[10px] font-black rounded-xl shadow-lg shadow-amber-500/20">WEEKLY</button>
                        <button className="px-4 py-2 bg-muted text-muted-foreground text-[10px] font-black rounded-xl hover:bg-muted/80">MONTHLY</button>
                      </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                      <Chart 
                        options={salesChartOptions} 
                        series={salesChartSeries} 
                        type="area" 
                        height="100%" 
                      />
                    </div>
                  </div>

                  {/* Category Performance Donut */}
                  <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black tracking-tight text-foreground mb-2">Sales Distribution</h3>
                    <p className="text-xs text-muted-foreground font-bold mb-8 text-center">Top performing categories</p>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <Chart 
                        options={categoryChartOptions} 
                        series={categoryChartSeries} 
                        type="donut" 
                        width="100%" 
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Row: Shop Profile & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                  {/* Shop Profile Summary */}
                  <div className="lg:col-span-12 bg-card border border-border rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    {/* Shop Banner */}
                    <div className="h-32 md:h-48 bg-muted relative overflow-hidden">
                      {shop?.banner ? (
                        <img src={shop.banner} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>

                    <div className="px-8 pb-8 relative z-10">
                      <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between w-full gap-6">
                        <div className="flex items-end gap-6">
                          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 shadow-2xl shrink-0 -mt-24">
                            <div className="w-full h-full bg-background rounded-[2rem] flex items-center justify-center overflow-hidden">
                              {shop?.avatar ? (
                                <img src={shop.avatar} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-12 h-12 text-amber-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="pb-2">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h3 className="text-3xl font-black text-foreground tracking-tight">{shop?.name || "Your Premium Shop"}</h3>
                              {shop?.username && (
                                <span className="text-sm font-bold text-muted-foreground">@{shop.username}</span>
                              )}
                              <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase ${
                                shop?.isVerified 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }`}>
                                {shop?.isVerified ? 'VERIFIED SELLER' : 'ACTIVE SELLER'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-xl">{shop?.description || "Welcome to your premium dashboard. Update your shop details in the settings tab."}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button className="flex-1 px-5 py-2.5 bg-muted text-foreground text-sm font-bold rounded-xl hover:bg-muted/80 transition-colors">Edit Profile</button>
                          <button className="flex-1 px-5 py-2.5 bg-amber-500 text-black text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">View Shop</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Orders & AI Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Recent Orders List */}
                  <div className="lg:col-span-8 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black tracking-tight text-foreground">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-amber-500 hover:underline flex items-center gap-1 uppercase">
                        VIEW ALL <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {recentOrders.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
                          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm font-bold text-muted-foreground">No orders recorded yet</p>
                        </div>
                      ) : (
                        recentOrders.map((order, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-muted transition-all border border-transparent hover:border-border group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                                <ShoppingBag className="w-6 h-6 text-muted-foreground group-hover:text-amber-500" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-foreground uppercase tracking-tight">ORD-{order._id.slice(-6).toUpperCase()}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="text-right hidden sm:block">
                                <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">Status</p>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full capitalize">{order.status}</span>
                              </div>
                              <div className="text-right min-w-[100px]">
                                <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">Total</p>
                                <p className="text-sm font-black text-foreground">KES {order.totalAmount.toLocaleString()}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-amber-500 transition-colors" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Insights & Optimization */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[2.5rem] p-8 text-black relative overflow-hidden shadow-xl shadow-amber-500/20 group">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                          <Sparkles className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Growth Insight</span>
                        </div>
                        <h4 className="text-2xl font-black mb-4 leading-tight">Your conversion rate is up 24%!</h4>
                        <p className="text-sm font-bold opacity-80 mb-8 leading-relaxed">Consider adding more products in the 'Electronics' category to capitalize on this trend.</p>
                        <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all">Optimize Inventory</button>
                      </div>
                      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-black/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-lg font-black text-foreground">Stock Alerts</h4>
                        <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg">3 LOW</span>
                      </div>
                      <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                              <p className="text-xs font-bold text-foreground">Premium Wireless...</p>
                            </div>
                            <span className="text-[10px] font-black text-rose-500">2 Left</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-black text-foreground mb-8">Performance Deep Dive</h3>
                    <div className="h-[400px]">
                      <Chart 
                        options={salesChartOptions} 
                        series={salesChartSeries} 
                        type="area" 
                        height="100%" 
                      />
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-black text-foreground mb-8">Sales by Category</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <Chart 
                        options={categoryChartOptions} 
                        series={categoryChartSeries} 
                        type="donut" 
                        width="100%" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-foreground">All Orders</h3>
                  <div className="flex gap-4">
                    <button className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                      <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order ID</th>
                        <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                        <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</th>
                        <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                        <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</th>
                        <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((order) => (
                        <tr key={order._id} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-6 font-black text-sm uppercase">ORD-{order._id.slice(-6)}</td>
                          <td className="py-6 text-xs text-muted-foreground font-bold">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-6 text-xs font-bold">{order.user?.name}</td>
                          <td className="py-6">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full uppercase">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-6 font-black text-sm">KES {order.totalAmount.toLocaleString()}</td>
                          <td className="py-6 text-right">
                            <button className="p-2 hover:bg-muted rounded-xl transition-colors">
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-foreground">Inventory Management</h3>
                  <button 
                    onClick={() => setShowProductModal(true)}
                    className="px-6 py-3 bg-amber-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20"
                  >
                    Add New Product
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product: any) => (
                    <div key={product._id} className="bg-muted/30 border border-border rounded-3xl p-4 group hover:border-amber-500/30 transition-all">
                      <div className="aspect-square bg-muted rounded-2xl mb-4 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-black text-sm mb-1 truncate">{product.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-4">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black">KES {product.price.toLocaleString()}</span>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${product.stock > 10 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {product.stock} IN STOCK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-black text-foreground mb-8">Your Customers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from(new Set(orders.map(o => o.user?._id))).map(userId => {
                    const userOrders = orders.filter(o => o.user?._id === userId);
                    const userData = userOrders[0]?.user;
                    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                    
                    return (
                      <div key={userId} className="bg-muted/30 border border-border rounded-3xl p-6 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 font-black">
                            {userData?.name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-sm">{userData?.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-bold">{userData?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-card border border-border rounded-2xl">
                            <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">Orders</p>
                            <p className="text-lg font-black text-foreground">{userOrders.length}</p>
                          </div>
                          <div className="p-3 bg-card border border-border rounded-2xl">
                            <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">Spent</p>
                            <p className="text-sm font-black text-foreground">KES {totalSpent.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card border border-border rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-black text-foreground mb-8">Shop Settings</h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shop Name</label>
                        <input 
                          type="text" 
                          defaultValue={shop?.name}
                          className="w-full bg-muted border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Username</label>
                        <input 
                          type="text" 
                          defaultValue={shop?.username}
                          className="w-full bg-muted border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shop Description</label>
                      <textarea 
                        rows={4}
                        defaultValue={shop?.description}
                        className="w-full bg-muted border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                      <button className="px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest">Discard</button>
                      <button className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20">Save Changes</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <ProductCreateModal 
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onCreated={() => {
          setShowProductModal(false);
          // Invalidate multiple possible product queries to ensure the dashboard updates
          queryClient.invalidateQueries({ queryKey: ["my-products"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
        shopName={shop?.name}
      />
    </div>
  );
}
