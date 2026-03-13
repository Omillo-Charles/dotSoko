"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/hooks/useUser";
import api from "@/lib/api";
import { toast } from "sonner";
import { 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Phone, 
  User as UserIcon,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateShippingFee } from "@/lib/shipping";

const CheckoutPage = () => {
  const router = useRouter();
  const { cartItems, subtotal, clearCart, isLoading: isCartLoading } = useCart();
  const { user, isLoading: isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    street: "",
  });
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Pre-fill form when user data is available
  useEffect(() => {
    if (user && !hasPrefilled) {
      const defaultAddress = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
      setFormData({
        name: user.name || "",
        phone: defaultAddress?.phone || "",
        city: defaultAddress?.city || "",
        street: defaultAddress?.street || "",
      });
      setHasPrefilled(true);
    }
  }, [user, hasPrefilled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          street: formData.street,
        },
        items: cartItems.map(item => ({
          product: item.product.id || item.product._id,
          shop: typeof item.product.shop === 'object' && item.product.shop !== null && ('id' in item.product.shop || '_id' in item.product.shop) 
            ? (item.product.shop as any).id || (item.product.shop as any)._id 
            : item.product.shop,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.image || item.product.image,
          size: item.size,
          color: item.color
        }))
      };

      const response = await api.post("/orders", orderData);
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Order placed successfully!");
        clearCart();
        // Keep success message for 3 seconds then redirect
        setTimeout(() => {
          router.push("/account/orders");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || isCartLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Thank You!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Your order has been placed successfully. A confirmation email has been sent to your email address and the shop owners.
        </p>
        <Link 
          href="/account/orders"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to your cart before checking out.</p>
        <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium">
          Start Shopping
        </Link>
      </div>
    );
  }

  const shippingFee = calculateShippingFee(subtotal);
  const total = subtotal + shippingFee;

  const formatPrice = (price: number) => {
    return `KES ${price?.toLocaleString() || 0}`;
  };

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-20 pt-4 md:pt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-foreground">Checkout</span>
        </div>

        <h1 className="text-3xl font-bold mb-10 text-foreground">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Delivery Section */}
              <section className="bg-background p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Delivery Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <UserIcon className="w-4 h-4 text-muted-foreground" /> Full Name
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                      placeholder="e.g. 0770000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> City / Area
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                      placeholder="e.g. Nairobi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> Street / Detailed Address
                    </label>
                    <input
                      required
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                      placeholder="e.g. Moi Avenue, Nairobi"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section className="bg-background p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
                </div>

                <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl flex items-center gap-4 cursor-default">
                  <div className="w-6 h-6 border-4 border-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Cash on Delivery</p>
                    <p className="text-sm text-primary/70">Pay when you receive your order</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-dashed border-border">
                  Note: Digital payment options (Mobile Money/Card) will be available soon as we scale.
                </p>
              </section>
            </form>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <div className="bg-background rounded-2xl shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 text-foreground">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id || item._id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <Image 
                        src={item.image || item.product.image || "/placeholder-product.png"} 
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1 text-foreground">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">By {item.product.shop?.name || "Official Store"}</p>
                      <p className="font-bold text-sm text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-6 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span className={shippingFee === 0 ? "text-emerald-500 font-medium" : "text-foreground font-medium"}>
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order ({formatPrice(total)})
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase font-bold tracking-widest">
                Secure Checkout Powered by Duuka
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
