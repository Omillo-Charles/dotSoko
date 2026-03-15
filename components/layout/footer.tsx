"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-20 md:pb-8 mt-auto border-t border-white/5">
      <div className="w-full px-4 md:px-8">
        
        {/* Newsletter Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center border-b border-white/5 pb-12 mb-12">
            <div>
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Join our newsletter</h3>
                <p className="text-slate-400">We&rsquo;ll send you a nice letter once per week. No spam.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full gap-2">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-slate-950 border border-white/10 text-slate-50 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center font-medium shrink-0">
                    Subscribe
                </button>
            </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Brand Info */}
            <div>
                <Link href="/" className="text-3xl font-bold text-slate-50 tracking-tight block mb-6">
                  <span className="text-secondary">.</span>Soko
                </Link>
                <p className="text-slate-400 mb-6 leading-relaxed">
                    The ultimate multivendor marketplace for all your shopping needs. Quality products, verified sellers, and fast delivery.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary shrink-0" />
                        <a href="mailto:support@dotsoko.com" className="hover:text-slate-50 transition-colors">support@dotsoko.com</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary shrink-0" />
                        <a href="tel:+1234567890" className="hover:text-slate-50 transition-colors">+1 (234) 567-890</a>
                    </div>
                </div>
            </div>

            {/* Column 2: Shopping */}
            <div>
                <h4 className="text-lg font-bold text-slate-50 mb-6">Shopping</h4>
                <ul className="space-y-4">
                    <li><Link href="/shop" className="hover:text-primary transition-colors">Browse Shop</Link></li>
                    <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
                    <li><Link href="/deals" className="hover:text-primary transition-colors">Flash Deals</Link></li>
                    <li><Link href="/brands" className="hover:text-primary transition-colors">Brands</Link></li>
                </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div>
                <h4 className="text-lg font-bold text-slate-50 mb-6">Customer Care</h4>
                <ul className="space-y-4">
                    <li><Link href={isLoggedIn ? "/account" : "/auth"} className="hover:text-primary transition-colors">My Account</Link></li>
                    <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
                    <li><Link href="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
                    <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
                </ul>
            </div>

            {/* Column 4: Socials */}
            <div>
                <h4 className="text-lg font-bold text-slate-50 mb-6">Follow Us</h4>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-slate-50 hover:border-primary">
                        <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-slate-50 hover:border-primary">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-slate-50 hover:border-primary">
                        <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-slate-50 hover:border-primary">
                        <Linkedin className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} <span className="text-secondary">.</span>Soko Marketplace. All rights reserved.</p>
            <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-slate-50 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-50 transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-slate-50 transition-colors">Cookie Policy</Link>
            </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
