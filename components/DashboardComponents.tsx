"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { GoldCheck } from "@/components/CommonUI";

/**
 * DashboardShell: A consistent container for dashboard pages with animations.
 */
export const DashboardShell = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}>
    {children}
  </div>
);

/**
 * DashboardHeader: A premium header for buyer and seller dashboards.
 */
interface DashboardHeaderProps {
  image?: string;
  initials?: string;
  isPremium?: boolean;
  statusBadge?: {
    label: string;
    icon?: React.ReactNode;
    className?: string;
  };
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  actions?: {
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    color?: string;
  }[];
}

export const DashboardHeader = ({
  image,
  initials,
  isPremium,
  statusBadge,
  title,
  subtitle,
  actions = []
}: DashboardHeaderProps) => {
  return (
    <div className="relative group overflow-hidden rounded-[3rem] border border-border shadow-sm dark:border-border/50 bg-background/40 backdrop-blur-3xl shadow-xl p-8 md:p-12">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
        
        {/* Identity Section */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-700" />
          <div className="relative w-32 h-32 md:w-40 md:h-40 shadow-2xl rounded-[2.4rem] overflow-hidden bg-background flex items-center justify-center">
              {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              ) : (
                <span className="text-4xl md:text-5xl font-black text-primary/80">
                  {initials || "U"}
                </span>
              )}
          </div>
          {isPremium && (
            <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-lg border border-border">
              <GoldCheck className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-4 flex-1">
          {statusBadge && (
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black text-primary uppercase tracking-[0.2em] ${statusBadge.className || ""}`}>
              {statusBadge.icon}
              {statusBadge.label}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none">
            {title}
          </h1>
          <div className="text-muted-foreground font-medium text-lg md:text-xl max-w-2xl">
            {subtitle}
          </div>
        </div>

        {/* Actions Section */}
        {actions.length > 0 && (
          <div className="flex flex-wrap justify-center lg:justify-end gap-4 w-full lg:w-auto">
            {actions.map((action, idx) => {
              const baseStyles = `flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-2xl ${action.color || "bg-primary text-primary-foreground shadow-primary/20"}`;
              
              if (action.href) {
                return (
                  <Link key={idx} href={action.href} className={baseStyles}>
                    {action.icon}
                    <span>{action.label}</span>
                  </Link>
                );
              }
              
              return (
                <button key={idx} onClick={action.onClick} className={baseStyles}>
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * DashboardStatCard: A card for metrics or quick links.
 */
interface DashboardStatCardProps {
  label: string;
  value?: string;
  desc?: string;
  icon: React.ReactNode;
  href?: string;
  color?: string; // bg-emerald-500 etc
  light?: string; // bg-emerald-500/10 etc
  text?: string;  // text-emerald-500 etc
  trend?: string; // +12.5%
  progress?: number; // 0-100
}

export const DashboardStatCard = ({
  label,
  value,
  desc,
  icon,
  href,
  color = "bg-primary",
  light = "bg-primary/10",
  text = "text-primary",
  trend,
  progress
}: DashboardStatCardProps) => {
  const content = (
    <div className="relative z-10 h-full flex flex-col">
      <div className={`w-14 h-14 ${light} ${text} rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
        {icon}
      </div>
      <div className="space-y-2 flex-1">
        <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em]">{label}</p>
        {value && <h3 className="text-3xl font-black text-foreground tracking-tight">{value}</h3>}
        {desc && <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>}
      </div>
      
      {(progress !== undefined || trend) && (
        <div className="mt-6 flex items-center gap-3">
          {progress !== undefined && (
            <div className="flex h-2 flex-1 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color} rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}
          {trend && <span className="text-xs font-black text-muted-foreground">{trend}</span>}
        </div>
      )}

      {href && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-transparent group-hover:bg-primary group-hover:text-white text-muted-foreground transition-all">
          <ArrowRight className="w-5 h-5" />
        </div>
      )}
    </div>
  );

  const wrapperStyles = "group relative overflow-hidden bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-sm dark:border-border/50 p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2";

  if (href) {
    return (
      <Link href={href} className={wrapperStyles}>
        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${light} blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperStyles}>
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${light} blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
      {content}
    </div>
  );
};

/**
 * DashboardSection: A section with a title and action.
 */
interface DashboardSectionProps {
  title: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
}

export const DashboardSection = ({ title, icon, action, children }: DashboardSectionProps) => (
  <div className="bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-border shadow-sm p-8 shadow-xl space-y-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            {icon}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{title}</h2>
      </div>
      {action && (
        <Link 
          href={action.href} 
          className="group flex items-center gap-2.5 text-primary font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
    {children}
  </div>
);

/**
 * DashboardListCard: A consistent card for list items.
 */
interface DashboardListCardProps {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  icon?: React.ReactNode;
  amount?: string;
  status?: string;
  statusVariant?: "success" | "warning";
  href: string;
}

export const DashboardListCard = ({
  id,
  title,
  subtitle,
  image,
  icon,
  amount,
  status,
  statusVariant = "warning",
  href
}: DashboardListCardProps) => (
  <div className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-background/60 backdrop-blur-3xl rounded-[2rem] border border-border shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 gap-6">
    <div className="flex items-center gap-6 flex-1 min-w-0">
      <div className="w-20 h-20 bg-muted/50 rounded-[1.5rem] flex items-center justify-center border border-border/50 group-hover:bg-primary/10 overflow-hidden transition-all duration-500 shrink-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="text-primary/30 group-hover:text-primary transition-colors duration-500">
            {icon}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-black text-foreground text-xl tracking-tighter leading-none italic uppercase truncate group-hover:text-primary transition-colors duration-500">
          {title}
        </h4>
        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 opacity-60">
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between md:text-right gap-6">
      <div>
        {amount && (
          <div className="text-xl font-black text-primary tracking-tighter italic">{amount}</div>
        )}
        {status && (
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            statusVariant === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusVariant === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'} animate-pulse`} />
            {status}
          </div>
        )}
      </div>
      <Link href={href} className="p-3 bg-background/60 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all duration-500 shadow-lg border border-border">
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  </div>
);
