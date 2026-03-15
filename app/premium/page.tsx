"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  X,
  Star,
  ArrowLeft,
} from "lucide-react";
import { PremiumUpgradeModal } from "@/components/modals/PremiumUpgradeModal";
import { useUser } from "@/hooks/useUser";

const PremiumPage = () => {
  const { user } = useUser();
  const [isAnnual, setIsAnnual] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    planName: "",
    price: ""
  });

  const handleUpgradeClick = (plan: any) => {
    if (plan.name === "Free") return;
    
    setUpgradeModal({
      isOpen: true,
      planName: plan.name,
      price: isAnnual ? plan.price.annual : plan.price.monthly
    });
  };

  const plans = [
    {
      name: "Free",
      id: "free",
      price: { monthly: "0", annual: "0" },
      description: "Essential tools for individuals",
      features: [
        "Unlimited product listings",
        "Standard seller dashboard",
        "Community support",
        "Basic analytics",
      ],
      buttonText: "Current Plan",
    },
    {
      name: "Premium",
      id: "premium",
      price: { monthly: "350", annual: "3360" },
      description: "Professional power for growing shops",
      features: [
        "Verification Gold Badge",
        "Priority in search results",
        "Get Paid to Sell (Monetization)",
        "Featured shop placement",
        "24/7 Priority support",
        "Lower transaction fees",
      ],
      buttonText: "Subscribe",
      popular: true,
    },
    {
      name: "Enterprise",
      id: "enterprise",
      price: { monthly: "750", annual: "7200" },
      description: "Scale your empire with professional tools",
      features: [
        "Everything in Premium",
        "Dedicated Account Manager",
        "Custom branding options",
        "Bulk inventory management",
        "Multi-user access (Teams)",
        "Revenue sharing programs",
      ],
      buttonText: "Subscribe",
    },
  ];

  const comparison = [
    {
      category: "Marketplace Presence",
      features: [
        { name: "Product Listings", free: true, premium: true, enterprise: true },
        { name: "Verification Gold Badge", free: false, premium: true, enterprise: true },
        { name: "Priority in Search", free: false, premium: true, enterprise: true },
        { name: "Featured Shop Placement", free: false, premium: true, enterprise: true },
      ]
    },
    {
      category: "Revenue & Analytics",
      features: [
        { name: "Get Paid to Sell", free: false, premium: "Tier 1", enterprise: "Tier 2" },
        { name: "Standard Sales Data", free: true, premium: true, enterprise: true },
        { name: "Revenue Sharing", free: false, premium: "5%", enterprise: "10%" },
        { name: "Lower Transaction Fees", free: false, premium: true, enterprise: true },
        { name: "Inventory Management", free: "Basic", premium: "Advanced", enterprise: "Bulk" },
      ]
    },
    {
      category: "Support & Teams",
      features: [
        { name: "Community Support", free: true, premium: true, enterprise: true },
        { name: "24/7 Priority Support", free: false, premium: true, enterprise: true },
        { name: "Account Manager", free: false, premium: false, enterprise: true },
        { name: "Multi-user Access", free: false, premium: false, enterprise: true },
      ]
    }
  ];

  const StatusIcon = ({ status }: { status: boolean | string }) => {
    if (status === true) return <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />;
    if (status === false) return <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />;
    return <span className="text-[10px] font-black uppercase tracking-tight text-foreground/70 text-center block">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground space-y-20 pb-24">
      <PremiumUpgradeModal 
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
        planName={upgradeModal.planName}
        price={upgradeModal.price}
        isAnnual={isAnnual}
      />

      {/* Simplified Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-6 xl:px-12 pt-10">
        <div className="flex items-center gap-6">
          <Link 
            href="/account/seller" 
            className="p-4 bg-background/60 backdrop-blur-3xl rounded-3xl transition-all text-muted-foreground hover:text-foreground border border-border shadow-sm shadow-xl group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">Premium Access</h1>
            <p className="text-muted-foreground font-medium text-lg">Elevate your commerce experience with advanced protocols.</p>
          </div>
        </div>

        {/* X-Style Toggle */}
        <div className="inline-flex items-center p-1 bg-background border border-border rounded-2xl shadow-xl relative self-start xl:self-center">
          <div 
            className={`absolute inset-y-1 transition-all duration-500 ease-out bg-primary rounded-xl shadow-lg shadow-primary/20 ${
              isAnnual ? 'left-1/2 w-[48%] -ml-0.5' : 'left-1 w-[48%]'
            }`}
          />
          <button 
            onClick={() => setIsAnnual(false)}
            className={`relative z-10 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${!isAnnual ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`relative z-10 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isAnnual ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Annual <span className="ml-1 opacity-60">-20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="w-full px-6 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = user?.isPremium 
              ? plan.id === (user.premiumPlan?.toLowerCase() || "premium")
              : plan.id === "free";

            return (
              <div 
                key={index}
                className={`group relative flex flex-col bg-background/40 backdrop-blur-3xl transition-all duration-500 rounded-[2.5rem] border ${
                  plan.popular 
                    ? 'border-primary ring-4 ring-primary/5 shadow-2xl shadow-primary/10' 
                    : 'border-border shadow-sm hover:border-primary/30'
                }`}
              >
                <div className="p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic text-foreground">{plan.name}</h3>
                    {plan.popular && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black text-primary uppercase tracking-widest">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Popular
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black tracking-tighter text-foreground">
                      KES {isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-40">
                      / {isAnnual ? 'yr' : 'mo'}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground font-medium text-sm mb-10 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="space-y-5 flex-1 mb-12">
                    {plan.features.slice(0, 4).map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-primary opacity-60" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wide text-foreground/70">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-[10px] font-black uppercase text-primary/60 pl-7 tracking-widest">+ and more</p>
                    )}
                  </div>

                  <button 
                    onClick={() => !isCurrentPlan && handleUpgradeClick(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                      isCurrentPlan
                        ? "bg-white/5 text-muted-foreground border border-border cursor-not-allowed"
                        : plan.popular
                        ? "bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isCurrentPlan ? "Active Protocol" : plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Comparison Table */}
      <div className="w-full px-6 xl:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Tier Comparison</h2>
            <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em]">Commercial Protocol Specifications</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-8">
            <table className="w-full border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-left">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Privileges</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-x border-border w-40">Free</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary w-40">Premium</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground w-40">Enterprise</th>
                    </tr>
                </thead>
                <tbody>
                    {comparison.map((cat, cIdx) => (
                        <React.Fragment key={cIdx}>
                            <tr>
                                <td colSpan={4} className="px-6 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/50 whitespace-nowrap">{cat.category}</span>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                    </div>
                                </td>
                            </tr>
                            {cat.features.map((feat, fIdx) => (
                                <tr key={fIdx} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-5 bg-background/20 rounded-l-3xl border-y border-l border-border">
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{feat.name}</span>
                                    </td>
                                    <td className="px-6 py-5 bg-background/20 border-y border-border text-center">
                                        <StatusIcon status={feat.free} />
                                    </td>
                                    <td className="px-6 py-5 bg-primary/5 border-y border-x border-primary/20 text-center">
                                        <StatusIcon status={feat.premium} />
                                    </td>
                                    <td className="px-6 py-5 bg-background/20 rounded-r-3xl border-y border-r border-border text-center">
                                        <StatusIcon status={feat.enterprise} />
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default PremiumPage;
