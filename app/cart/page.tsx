"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { calculateShippingFee } from '@/lib/shipping';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard,
  ChevronRight,
  Store,
  Loader2
} from 'lucide-react';

const CartPage = () => {
  const { cartItems, isLoading, updateQuantity, removeFromCart, subtotal } = useCart();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shipping = calculateShippingFee(subtotal);
  const total = subtotal + shipping;

  const formatPrice = (price: number) => {
    return `KES ${price?.toLocaleString() || 0}`;
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-128px)] bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-background p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 flex flex-col items-center gap-6 border border-border max-w-md w-full text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Your cart is empty</h2>
            <p className="text-muted-foreground font-medium">Looks like you haven't added anything to your cart yet.</p>
          </div>
          <Link 
            href="/shop" 
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
          >
            Start Shopping
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-20 pt-4 md:pt-10">
      <div className="w-full px-4 md:px-8 py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-semibold text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              Your Cart
              <span className="text-lg font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item: any, idx: number) => {
              const keyBase = item.id || item?._id || `${item?.product?._id || item?.product?.id || 'prod'}-${item?.size || ''}-${item?.color || ''}`;
              const key = `${keyBase}-${idx}`;
              return (
              <div key={key} className="group bg-background rounded-[2.5rem] p-6 md:p-8 border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Product Image */}
                  <div 
                    onClick={() => router.push(`/shop/product/${item.product.id || item.product._id}`)}
                    className="relative w-full md:w-48 aspect-square rounded-[1.25rem] overflow-hidden bg-muted border border-border shrink-0 cursor-pointer flex items-center justify-center"
                  >
                    <img 
                      src={item.image || item.product.image} 
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/shop/${item.product.shop?.username ? `@${item.product.shop.username}` : item.product.shop?._id || item.product.shop?.id || item.product.shop}`}
                          className="flex items-center gap-2 mb-2 hover:text-primary transition-colors group/shop"
                        >
                          <Store className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest truncate group-hover/shop:underline">
                            {item.product.shop?.name || "Official Store"}
                          </span>
                          {item.product.shop?.username && (
                            <span className="text-[9px] font-bold text-muted-foreground">
                              @{item.product.shop.username}
                            </span>
                          )}
                        </Link>
                        <h3 
                          onClick={() => router.push(`/shop/product/${item.product.id || item.product._id}`)}
                          className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight cursor-pointer"
                        >
                          {item.product.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          {item.size && (
                            <span className="text-xs font-bold text-muted-foreground">
                              SIZE: <span className="text-foreground">{item.size}</span>
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs font-bold text-muted-foreground">
                              COLOR: <span className="text-foreground">{item.color}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id || item._id)}
                        className="p-2 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                        <button 
                          onClick={() => updateQuantity(item.id || item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-background hover:text-primary rounded-lg transition-all disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-background hover:text-primary rounded-lg transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        <div className="text-xs font-bold text-muted-foreground">
                          {formatPrice(item.product.price)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )})}

            {/* Trust Badges - Hidden on mobile, shown on desktop here */}
            <div className="hidden lg:grid grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Fast Delivery</div>
                  <div className="text-xs text-muted-foreground">2-3 business days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Buyer Protection</div>
                  <div className="text-xs text-muted-foreground">Secure transactions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Easy Payment</div>
                  <div className="text-xs text-muted-foreground">Multiple options</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-background p-8 rounded-[2.5rem] border border-border shadow-xl shadow-primary/5 sticky top-32">
              <h2 className="text-2xl font-black text-foreground tracking-tight mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-muted-foreground font-bold">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground font-bold">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-500 dark:text-emerald-400" : "text-foreground"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="pt-6 border-t border-border flex justify-between items-center">
                  <span className="text-foreground font-bold">Total</span>
                  <div className="text-right">
                    <div className="text-xl font-black text-primary leading-none">
                      {formatPrice(total)}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-bold tracking-wider uppercase">VAT INCLUDED</p>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-8">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">
                  Promo Code
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm min-w-0 text-foreground"
                  />
                  <button className="bg-foreground text-background px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shrink-0">
                    Apply
                  </button>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
              >
                Checkout Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-center gap-4 grayscale opacity-40">
                  {/* Payment Methods Icons Mockup */}
                  <div className="w-10 h-6 bg-muted rounded"></div>
                  <div className="w-10 h-6 bg-muted rounded"></div>
                  <div className="w-10 h-6 bg-muted rounded"></div>
                  <div className="w-10 h-6 bg-muted rounded"></div>
                </div>
              </div>
            </div>

            {/* Trust Badges - Shown on mobile here, hidden on desktop */}
            <div className="grid lg:hidden grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Fast Delivery</div>
                  <div className="text-xs text-muted-foreground">2-3 business days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Buyer Protection</div>
                  <div className="text-xs text-muted-foreground">Secure transactions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Easy Payment</div>
                  <div className="text-xs text-muted-foreground">Multiple options</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default CartPage;
