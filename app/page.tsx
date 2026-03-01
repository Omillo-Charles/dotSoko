import Link from "next/link";
import { Zap, Truck, ShieldCheck, Headphones, ChevronRight } from "lucide-react";
import Categories from "@/components/categories";
import FeaturedProducts from "@/components/featuredProducts";
import Footer from "@/components/footer";
import { Updates } from "@/components/Updates";
import { BannerCarousel } from "@/components/BannerCarousel";

export default function Home() {
  return (
    <main className="flex flex-col pt-4 md:pt-4">
      {/* Minimalist Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand-soft-blue via-brand-soft-indigo/30 to-transparent"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      <section className="border-y border-border bg-muted/20">
        <Updates />
      </section>

      <Categories />
      <FeaturedProducts />
      <BannerCarousel />

      <section className="bg-muted/30 backdrop-blur-sm">
        <div className="w-full px-4 md:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            <div className="group flex flex-col items-center justify-center text-center gap-3 bg-background/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-primary/10 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-foreground">Fast Delivery</div>
                <div className="text-sm text-muted-foreground">Across all regions</div>
              </div>
            </div>

            <div className="group flex flex-col items-center justify-center text-center gap-3 bg-background/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-primary/10 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-foreground">Secure Payment</div>
                <div className="text-sm text-muted-foreground">Encrypted and protected</div>
              </div>
            </div>

            <div className="group flex flex-col items-center justify-center text-center gap-3 bg-background/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-primary/10 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-foreground">24/7 Support</div>
                <div className="text-sm text-muted-foreground">We are here to help</div>
              </div>
            </div>

            <div className="group flex flex-col items-center justify-center text-center gap-3 bg-background/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-primary/10 hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-foreground">Best Deals</div>
                <div className="text-sm text-muted-foreground">Daily discounts</div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
