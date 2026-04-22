"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, X, Loader2, Store, Tag, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { usePopularShops } from "@/hooks/useShop";
import { categories } from "@/constants/categories";

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Pre-fetch popular shops for instant local filtering
  const { data: popularShopsData } = usePopularShops(30);

  // Instant local filtering for Categories
  const localCategoryResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return categories
      .filter(c => c.value !== "all" && c.label.toLowerCase().includes(q))
      .slice(0, 3);
  }, [query]);

  // Instant local filtering for Shops
  const localShopResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (popularShopsData || [])
      .filter((s: any) => 
        s.name.toLowerCase().includes(q) || 
        (s.username && s.username.toLowerCase().includes(q))
      )
      .slice(0, 3);
  }, [query, popularShopsData]);

  const hasAnySuggestions = suggestions.length > 0 || localCategoryResults.length > 0 || localShopResults.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProductSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/products?q=${query}&limit=5`);
        if (response.data.success) {
          setSuggestions(response.data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // If we have local results, show them immediately
    if (query.trim().length >= 1 && (localCategoryResults.length > 0 || localShopResults.length > 0)) {
      setShowSuggestions(true);
    }

    const timeoutId = setTimeout(fetchProductSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, localCategoryResults, localShopResults]);

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    const cat = category || "all";
    const params = new URLSearchParams();
    if (cat && cat !== "all") params.set("cat", cat);
    if (q) params.set("q", q);
    
    setShowSuggestions(false);
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSuggestionClick = (product: any) => {
    setQuery(product.name);
    setShowSuggestions(false);
    router.push(`/shop/product/${product.id || product._id}`);
  };

  const handleCategoryClick = (catValue: string) => {
    setShowSuggestions(false);
    router.push(`/shop?cat=${catValue}`);
  };

  const handleShopClick = (shop: any) => {
    setShowSuggestions(false);
    const handle = shop.username ? `@${shop.username}` : shop.id || shop._id;
    router.push(`/shop/${handle}`);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={onSubmit} className="flex w-full relative">
        <div className="relative shrink-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block h-11 border border-r-0 border-white/10 rounded-l-2xl bg-white/5 text-slate-50 pl-2 pr-6 md:pl-4 md:pr-10 text-[10px] md:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-[70px] md:w-[110px] appearance-none truncate transition-all"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="bg-slate-900 text-slate-50">
                {c.label}
              </option>
            ))}
          </select>
          <div className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-2.5 md:h-2.5">
              <path d="M1 3L4 6L7 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (query.trim().length >= 1 || hasAnySuggestions) && setShowSuggestions(true)}
            type="text"
            placeholder="Search products, shops or categories..."
            className="w-full h-11 border-y border-white/10 bg-white/5 rounded-none px-3 md:px-4 text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 text-sm font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="h-11 px-4 md:px-6 bg-secondary hover:bg-secondary/90 text-primary-foreground rounded-r-2xl transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          <span className="hidden md:inline font-bold text-xs uppercase tracking-wider">Search</span>
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && query.trim().length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {hasAnySuggestions ? (
            <div className="py-2">
              {/* Category Results (Instant) */}
              {localCategoryResults.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" />
                    Categories
                  </div>
                  {localCategoryResults.map((cat: any) => (
                    <div
                      key={cat.value}
                      onClick={() => handleCategoryClick(cat.value)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <cat.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white">{cat.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                </div>
              )}

              {/* Shop Results (Instant) */}
              {localShopResults.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
                    <Store className="w-3 h-3 text-secondary" />
                    Shops
                  </div>
                  {localShopResults.map((shop: any) => (
                    <div
                      key={shop.id || shop._id}
                      onClick={() => handleShopClick(shop)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-secondary transition-all">
                          <img src={shop.avatar || "/defaultAvatar.jpeg"} alt={shop.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-secondary transition-colors">{shop.name}</p>
                          <p className="text-[10px] font-medium text-slate-500">{shop.username ? `@${shop.username}` : "Verified Shop"}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                </div>
              )}

              {/* Product Results (API) */}
              {suggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
                    <ShoppingBag className="w-3 h-3 text-emerald-500" />
                    Products
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {suggestions.map((product, index) => (
                      <div
                        key={product.id || product._id || index}
                        onClick={() => handleSuggestionClick(product)}
                        className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-all group border-b border-white/5 last:border-0"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/5 group-hover:border-primary/30 transition-colors">
                          <img
                            src={product.images?.[0] || product.image || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-50 truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-primary">
                              KES {product.price?.toLocaleString()}
                            </span>
                            {product.oldPrice && (
                              <span className="text-[10px] text-slate-500 line-through">
                                KES {product.oldPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => onSubmit()}
                className="w-full py-3 px-4 text-center text-[10px] font-black text-slate-500 hover:text-primary hover:bg-white/5 border-t border-white/5 transition-all uppercase tracking-widest mt-2"
              >
                See all results for "{query}"
              </button>
            </div>
          ) : !isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-200">No instant results found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different search term or browse categories</p>
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Searching everything...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
