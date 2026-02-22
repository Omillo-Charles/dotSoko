"use client";

import React from "react";
import Link from "next/link";
import { Scale, Gavel, ShieldCheck, ShoppingBag, Users, AlertCircle, FileText, Bell, Mail } from "lucide-react";

const TermsPage = () => {
  const lastUpdated = "January 14, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: <ShieldCheck className="w-5 h-5" />,
      content: [
        <>By accessing or using <span className="text-secondary font-semibold">.Soko</span>, you agree to be bound by these Terms of Service.</>,
        "If you do not agree to these terms, you may not use our platform or services.",
        "We reserve the right to modify these terms at any time, with updates effective upon posting.",
        "Continued use of the platform constitutes acceptance of any updated terms."
      ]
    },
    {
      title: "2. Marketplace Platform",
      icon: <ShoppingBag className="w-5 h-5" />,
      content: [
        <><span className="text-secondary font-semibold">.Soko</span> provides a marketplace where sellers can list products and buyers can purchase them.</>,
        "We are not the seller of items listed by third-party vendors on the platform.",
        "Transactions are directly between the buyer and the seller.",
        "We facilitate payment processing but are not responsible for product quality or delivery by sellers."
      ]
    },
    {
      title: "3. User Accounts",
      icon: <Users className="w-5 h-5" />,
      content: [
        "You must provide accurate and complete information when creating an account.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "Users must be at least 18 years old or have parental/guardian consent.",
        "We reserve the right to suspend or terminate accounts that violate our community guidelines."
      ]
    },
    {
      title: "4. Fees and Payments",
      icon: <Scale className="w-5 h-5" />,
      content: [
        "Sellers agree to pay the commission fees specified in the Seller Agreement.",
        "Buyers are responsible for the purchase price and any applicable shipping or tax fees.",
        "All payments are processed through secure third-party payment gateways.",
        "Refunds are subject to our Return Policy and individual seller terms."
      ]
    }
  ];

  return (
    <main className="flex flex-col pb-24 lg:pb-0 bg-muted/30 pt-4 md:pt-10">
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold mb-4">
              <Scale className="w-3.5 h-3.5" />
              Legal Framework
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              These terms govern your use of the <span className="text-secondary font-semibold">.Soko</span> marketplace. Please read them 
              carefully to understand your rights and obligations as a user of our platform.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Version 1.2
              </span>
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                Last updated: {lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-background border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                </div>
                <ul className="space-y-4">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex gap-3 text-muted-foreground leading-relaxed">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/30 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="p-8 bg-slate-900 dark:bg-slate-800 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Cookies & Tracking</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, 
                  and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
                </p>
                <button className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors">
                  Manage Cookie Settings
                </button>
              </div>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-[80px] lg:top-[128px]">
              <div className="bg-background border border-border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-foreground mb-4">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  If you need clarification on any of our terms or have a specific legal inquiry, 
                  our compliance team is here to assist you.
                </p>
                <a 
                  href="mailto:legal@dotsoko.com"
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground/60">Legal Department</div>
                    <div className="text-sm font-bold text-foreground">legal@dotsoko.com</div>
                  </div>
                </a>
              </div>

              <div className="bg-muted/50 rounded-2xl p-6">
                <h4 className="font-bold text-foreground text-sm mb-4">Legal Directory</h4>
                <nav className="space-y-3">
                  {[
                    { name: 'Terms of Service', href: '/terms' },
                    { name: 'Cookie Policy', href: '/cookies' },
                    { name: 'Returns & Refunds', href: '/returns' },
                    { name: 'Help Center', href: '/help' }
                  ].map((item) => (
                    <Link 
                      key={item.name}
                      href={item.href} 
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsPage;
