"use client";

import React from "react";
import Link from "next/link";
import { FileText, Bell, Mail, ArrowRight } from "lucide-react";
import { LegalContent } from "@/constants/legal";

interface LegalLayoutProps {
  content: LegalContent;
  children?: React.ReactNode; // For extra content like about stats
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ content, children }) => {
  return (
    <main className="flex flex-col pb-24 lg:pb-0 bg-muted/30 pt-4 md:pt-10">
      {/* Header Section */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-8 pb-8 md:pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold mb-4">
              {content.badge.icon}
              {content.badge.text}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              {content.title}
            </h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              {content.description}
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Version {content.version}
              </span>
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                Last updated: {content.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {children}

            {/* Content Sections */}
            {content.sections.map((section, idx) => (
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
                      <div>{item}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* CTA Card */}
            {content.ctaCard && (
              <div className="p-8 bg-slate-900 dark:bg-slate-800 rounded-3xl text-white relative overflow-hidden border border-border/50">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-primary">{content.ctaCard.icon}</div>
                    <h3 className="text-2xl font-bold">{content.ctaCard.title}</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {content.ctaCard.description}
                  </p>
                  
                  {content.ctaCard.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {content.ctaCard.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {content.ctaCard.buttonText && (
                    content.ctaCard.buttonLink ? (
                      <Link 
                        href={content.ctaCard.buttonLink}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                      >
                        {content.ctaCard.buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors">
                        {content.ctaCard.buttonText}
                      </button>
                    )
                  )}
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-[80px] lg:top-[128px]">
              
              {/* Question/Contact Card */}
              {content.sidebar && (
                <div className="bg-background border border-border rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-foreground mb-4">{content.sidebar.questionTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {content.sidebar.questionDesc}
                  </p>
                  <a 
                    href={`mailto:${content.sidebar.contactEmail}`}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground/60">{content.sidebar.contactLabel}</div>
                      <div className="text-sm font-bold text-foreground">{content.sidebar.contactEmail}</div>
                    </div>
                  </a>
                </div>
              )}

              {/* Legal Directory / Links */}
              <div className="bg-muted/50 rounded-2xl p-6">
                <h4 className="font-bold text-foreground text-sm mb-4">Legal Directory</h4>
                <nav className="space-y-3">
                  {[
                    { name: 'Privacy Policy', href: '/privacy' },
                    { name: 'Terms of Service', href: '/terms' },
                    { name: 'Cookie Policy', href: '/cookies' },
                    { name: 'Returns & Refunds', href: '/returns' },
                    { name: 'Help Center', href: '/help' },
                    { name: 'Contact', href: '/contact' }
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

export default LegalLayout;
