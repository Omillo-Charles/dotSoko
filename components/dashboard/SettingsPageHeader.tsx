"use client";

import React from "react";

interface SettingsPageHeaderProps {
  icon: React.ReactNode;
  badge?: {
    label: string;
    icon?: React.ReactNode;
    className?: string;
  };
  title: string;
  description: string;
  glowColor?: string; // e.g. "from-primary/30 via-red-500/30 to-primary/30"
  action?: React.ReactNode;
}

/**
 * Shared premium glassmorphic header for all settings pages.
 * Matches the language of the Security Center page header.
 */
export const SettingsPageHeader = ({
  icon,
  badge,
  title,
  description,
  glowColor = "from-primary/30 via-secondary/30 to-primary/30",
  action,
}: SettingsPageHeaderProps) => {
  return (
    <div className="relative group p-0.5">
      <div className={`absolute inset-0 bg-gradient-to-r ${glowColor} blur-3xl opacity-50 transition-opacity duration-1000`} />
      <div className="relative overflow-hidden rounded-[3.5rem] border border-border shadow-sm dark:border-border/50 bg-background/40 backdrop-blur-3xl shadow-2xl p-8 md:p-14">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6 md:gap-12">
            {/* Icon Badge */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-700" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 p-2 rounded-[3.2rem] bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-md shadow-2xl">
                <div className="w-full h-full rounded-[2.8rem] bg-background border border-border dark:border-border/50 grid place-items-center">
                  {icon}
                </div>
              </div>
            </div>

            {/* Text area */}
            <div className="space-y-4">
              {badge && (
                <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black text-primary uppercase tracking-[0.2em] ${badge.className || ""}`}>
                  {badge.icon}
                  {badge.label}
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
                {title}
              </h1>
              <p className="text-muted-foreground text-base md:text-xl font-medium max-w-xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Optional action */}
          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
