"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { categories } from "@/constants/categories";

// Move items outside to ensure stability and avoid hydration issues
const CATEGORY_ITEMS = [
  { name: "Home Décor", href: "/shop?cat=home-decor", image: "/categories/home%20decor/decor.jpg", value: "home-decor" },
  { name: "Kitchenware", href: "/shop?cat=kitchenware", image: "/categories/kitchenware/kitchen.jpg", value: "kitchenware" },
  { name: "Books & Stationery", href: "/shop?cat=books-stationery", image: "/categories/stationery/stationery.jpg", value: "books-stationery" },
  { name: "Baby Products", href: "/shop?cat=baby-products", image: "/categories/baby%20products/baby.jpg", value: "baby-products" },
  { name: "Toys & Games", href: "/shop?cat=toys-games", image: "/categories/toys/toys.jpg", value: "toys-games" },
  { name: "Sports & Fitness Equipment", href: "/shop?cat=sports-fitness", image: "/categories/sports/sports.jpg", value: "sports-fitness" },
  { name: "Computer Accessories", href: "/shop?cat=computer-accessories", image: "/categories/computer%20accessories/computer.jpg", value: "computer-accessories" },
  { name: "Office Supplies", href: "/shop?cat=office-supplies", image: "/categories/office%20supplies/office.jpg", value: "office-supplies" },
  { name: "Digital Products", href: "/shop?cat=digital-products", image: "/categories/digital%20products/digital.jpg", value: "digital-products" },
  { name: "Automotive Accessories", href: "/shop?cat=automotive-accessories", image: "/categories/automotive/automotive.jpg", value: "automotive-accessories" },
  { name: "Pet Supplies", href: "/shop?cat=pet-supplies", image: "/categories/pet/pet.jpg", value: "pet-supplies" },
  { name: "Health Products", href: "/shop?cat=health-products", image: "/categories/health/health.jpg", value: "health-products" },
  { name: "Craft & DIY Supplies", href: "/shop?cat=craft-diy", image: "/categories/craft/craft.jpg", value: "craft-diy" },
  { name: "Event & Party Supplies", href: "/shop?cat=event-party-supplies", image: "/categories/events%20and%20parties/event.jpg", value: "event-party-supplies" },
  { name: "Clothing & Apparel", href: "/shop?cat=clothing-apparel", image: "/categories/clothing/clothing.jpg", value: "clothing-apparel" },
  { name: "Footwear", href: "/shop?cat=footwear", image: "/categories/footwear/footwear.jpg", value: "footwear" },
  { name: "Fashion Accessories", href: "/shop?cat=fashion-accessories", image: "/categories/fashion/fashionaccessories.jpg", value: "fashion-accessories" },
  { name: "Electronics", href: "/shop?cat=electronics", image: "/categories/electronics/electronics.jpg", value: "electronics" },
  { name: "Phone Accessories", href: "/shop?cat=phone-accessories", image: "/categories/phone%20accessories/phones.jpg", value: "phone-accessories" },
  { name: "Home Appliances", href: "/shop?cat=home-appliances", image: "/categories/home%20appliances/home.jpg", value: "home-appliances" },
  { name: "Beauty Products", href: "/shop?cat=beauty-products", image: "/categories/beauty%20products/beauty.jpg", value: "beauty-products" },
  { name: "Personal Care Items", href: "/shop?cat=personal-care", image: "/categories/personal%20care/personal.jpg", value: "personal-care" },
  { name: "Watches & Jewelry", href: "/shop?cat=watches-jewelry", image: "/categories/jewelary/watches.jpg", value: "watches-jewelry" },
  { name: "Groceries & Packaged Foods", href: "/shop?cat=groceries-packaged-foods", image: "/categories/groceries%20and%20foods/groceries.jpg", value: "groceries-packaged-foods" },
  { name: "Furniture", href: "/shop?cat=furniture", image: "/categories/furniture/furniture.jpg", value: "furniture" },
  { name: "Farm Products", href: "/shop?cat=farm-products", image: "/categories/farm%20products/farm.jpg", value: "farm-products" },
];

const Categories = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!isMounted) return null;

  return (
    <section className="bg-background">
      <div className="w-full px-4 md:px-8 pt-2 md:pt-0 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Shop by Category</h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/categories" 
              className="text-primary text-sm font-bold hover:underline"
            >
              See all
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scroll("left")}
                className="p-2 border border-border rounded hover:bg-muted text-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scroll("right")}
                className="p-2 border border-border rounded hover:bg-muted text-foreground"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto md:overflow-x-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] md:[scrollbar-width:auto]"
        >
          {/* hide scrollbar on mobile */}
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
            @media (min-width: 768px) {
              div::-webkit-scrollbar { display: initial; height: 8px; }
            }
          `}</style>
          {CATEGORY_ITEMS.map((item) => {
          const categoryInfo = categories.find(c => c.value === item.value);
            const Icon = categoryInfo?.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group min-w-[220px] md:min-w-[260px] border border-border rounded-[1.25rem] overflow-hidden hover:shadow-sm transition bg-background"
              >
                <div className="relative aspect-square bg-muted flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 220px, 260px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                  {Icon && (
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md p-2 rounded-xl border border-border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
