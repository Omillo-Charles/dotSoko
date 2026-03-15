"use client";

import React from "react";
import Link from "next/link";
import { 
  Users, 
  Loader2
} from "lucide-react";
import Footer from "@/components/layout/footer";
import { useStats } from "@/hooks/useStats";
import LegalLayout from "@/components/layout/LegalLayout";
import { LEGAL_PAGES } from "@/constants/legal";

const AboutPage = () => {
  const { data: statsData, isLoading: isStatsLoading } = useStats();

  const stats = [
    { label: "Active Users", value: statsData?.users ? `${statsData.users}+` : "..." },
    { label: "Verified Sellers", value: statsData?.shops ? `${statsData.shops}+` : "..." },
    { label: "Products Sold", value: statsData?.products ? `${statsData.products}+` : "..." },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <LegalLayout content={LEGAL_PAGES.about}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-background border border-border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center min-h-[120px]">
              {isStatsLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-6 h-6 text-primary/30 animate-spin" />
                </div>
              ) : (
                <p className="text-2xl md:text-3xl font-black text-foreground mb-1">{stat.value}</p>
              )}
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* About specific seller CTA logic would go here if needed, but keeping it clean for now */}
      </LegalLayout>
      
      {/* Footer can be kept global or per page, here it was per page */}
      <Footer />
    </div>
  );
};

export default AboutPage;
