"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SellerAnalyticsProps {
  orders: any[];
  products: any[];
  shopId: string;
}

export const SellerAnalytics = ({ orders, products, shopId }: SellerAnalyticsProps) => {
  // 1. Process Revenue Trend (Last 7 Days)
  const revenueTrend = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyRevenue = last7Days.reduce((acc: any, date) => {
      acc[date] = 0;
      return acc;
    }, {});

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyRevenue[orderDate] !== undefined && order.status !== 'cancelled') {
        const shopItemsTotal = order.items
          .filter((item: any) => (item.shop?._id || item.shop) === shopId)
          .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        dailyRevenue[orderDate] += shopItemsTotal;
      }
    });

    return {
      categories: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      }),
      data: Object.values(dailyRevenue)
    };
  }, [orders, shopId]);

  // 2. Process Order Status Distribution
  const statusDistribution = useMemo(() => {
    const counts: any = { delivered: 0, processing: 0, cancelled: 0, shipped: 0, pending: 0 };
    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      } else {
        counts.pending++;
      }
    });

    return {
      labels: Object.keys(counts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      series: Object.values(counts) as number[]
    };
  }, [orders]);

  // 3. Performance Metrics
  const metrics = useMemo(() => {
    const totalEarnings = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, order) => {
        const shopTotal = order.items
          .filter((item: any) => (item.shop?._id || item.shop) === shopId)
          .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        return acc + shopTotal;
      }, 0);

    const avgOrderValue = orders.length > 0 ? totalEarnings / orders.length : 0;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const deliveryRate = orders.length > 0 ? (deliveredCount / orders.length) * 100 : 0;

    return [
      { label: "Avg. Order Value", value: `KES ${Math.round(avgOrderValue).toLocaleString()}`, sub: "+12.4%", icon: ShoppingBag, color: "text-blue-500" },
      { label: "Total Reach", value: products.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString(), sub: "Organic", icon: Users, color: "text-purple-500" },
      { label: "Delivery Rate", value: `${Math.round(deliveryRate)}%`, sub: "High Efficiency", icon: TrendingUp, color: "text-emerald-500" },
      { label: "Market Health", value: "Premium", sub: "Top 2% Cluster", icon: BarChart3, color: "text-amber-500" }
    ];
  }, [orders, products, shopId]);

  // Chart Options
  const revenueOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent'
    },
    colors: ['#6366f1'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100]
      }
    },
    xaxis: {
      categories: revenueTrend.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 },
        formatter: (val: number) => `KES ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val: number) => `KES ${val.toLocaleString()}` }
    }
  };

  const statusOptions: any = {
    chart: { type: 'donut' },
    colors: ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#94a3b8'],
    labels: statusDistribution.labels,
    legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
    stroke: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, color: '#94a3b8' },
            value: { show: true, color: '#f8fafc', fontWeight: 900 }
          }
        }
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Insights & Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 dark:border-white/5 p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
            <div>
              <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] mb-1">Performance</p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">Revenue Trends</h3>
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
              Live Data
            </div>
          </div>

          <div className="h-[350px] w-full relative z-10">
            <Chart
              options={revenueOptions}
              series={[{ name: "Revenue", data: revenueTrend.data as number[] }]}
              type="area"
              height="100%"
              width="100%"
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 dark:border-white/5 p-8 shadow-2xl flex flex-col items-center justify-center text-center group relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="mb-8 w-full text-left">
            <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] mb-1">Operations</p>
            <h3 className="text-2xl font-black text-foreground tracking-tight">Sales Split</h3>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center relative z-10">
            <Chart
              options={statusOptions}
              series={statusDistribution.series as number[]}
              type="donut"
              height="100%"
              width="100%"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-muted/30 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Live Feed</p>
              <p className="text-xl font-black text-primary italic">ACTIVE</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Orders</p>
              <p className="text-xl font-black text-foreground">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {metrics.map((item, idx) => (
           <div key={idx} className="bg-background/40 backdrop-blur-md rounded-[2.2rem] border border-white/10 p-6 flex items-center gap-5 hover:border-primary/30 transition-all cursor-pointer group">
             <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <item.icon className={`w-6 h-6 ${item.color}`} />
             </div>
             <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
               <div className="flex items-center gap-2">
                 <p className="text-lg font-black text-foreground">{item.value}</p>
                 <span className={`text-[10px] font-bold ${item.sub.startsWith('+') ? 'text-emerald-500' : 'text-primary'}`}>{item.sub}</span>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default SellerAnalytics;
