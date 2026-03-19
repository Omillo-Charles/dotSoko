"use client";

import React, { useState } from "react";
import { 
  Store, 
  Bell, 
  CreditCard, 
  LifeBuoy,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Send,
  Loader2,
  MapPin,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export const NotificationsView = () => (
  <div className="p-20 text-center bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border animate-in fade-in duration-700">
    <Bell className="w-16 h-16 text-primary/20 mx-auto mb-6" />
    <h2 className="text-2xl font-black text-foreground">Notifications</h2>
    <p className="text-muted-foreground mt-2">Notification center coming soon...</p>
  </div>
);

export const PaymentsView = () => (
  <div className="p-20 text-center bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border animate-in fade-in duration-700">
    <CreditCard className="w-16 h-16 text-primary/20 mx-auto mb-6" />
    <h2 className="text-2xl font-black text-foreground">Payments</h2>
    <p className="text-muted-foreground mt-2">Payment gateway coming soon...</p>
  </div>
);

export const SupportView = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1";
      const response = await fetch(`${apiUrl}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(response.statusText || "Server returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to send message");
      }

      toast.success(data?.message || "Thank you! Your message has been sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const XIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link 
            href="/account/seller?view=overview" 
            className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-border group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Seller Support</h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
               <LifeBuoy className="w-4 h-4 text-emerald-500" />
               Need help with your shop? Send us a message below.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Contact Form Column */}
        <div className="xl:col-span-8">
          <div className="bg-background/40 backdrop-blur-3xl border border-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Send a Message</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Your Name</label>
                  <input 
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={onChange}
                    className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Subject</label>
                <input 
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={onChange}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Message</label>
                <textarea 
                  name="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={onChange}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium resize-none"
                  placeholder="Describe your inquiry..."
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background py-4 rounded-2xl font-bold text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Direct Contact Card */}
          <div className="bg-background/40 backdrop-blur-3xl border border-border rounded-3xl p-8 space-y-6">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 px-1">Direct Contact</h3>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "+254 700 000 000", href: "tel:+254700000000" },
                { icon: Mail, label: "Email", value: "support@dotsoko.com", href: "mailto:support@dotsoko.com" },
                { icon: Globe, label: "Web", value: "www.dotsoko.com", href: "https://dotsoko.com" }
              ].map((item, i) => (
                <a 
                  key={i}
                  href={item.href}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all group border border-border/50"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-foreground">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-background/40 backdrop-blur-3xl border border-border rounded-3xl p-8 space-y-6">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 px-1">Visit Us</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-relaxed text-balance">
                  Innovation District, Nairobi, Kenya<br />
                  Central Business Complex, Hub 44
                </p>
              </div>
            </div>
          </div>

          {/* Social Connects */}
          <div className="bg-muted/30 border border-border rounded-3xl p-8 space-y-6">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 px-1">Connect with Us</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: XIcon, label: "X", href: "#" },
                { icon: Facebook, label: "Facebook", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href}
                  className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group shadow-sm hover:shadow-md"
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
