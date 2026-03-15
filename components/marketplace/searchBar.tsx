"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, X, Loader2 } from "lucide-react";
import api from "@/lib/api";

import { categories } from "@/constants/categories";

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    const fetchSuggestions = async () => {
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

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

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
    router.push(`/shop/product/${product._id}`);
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
            onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
            type="text"
            placeholder="Search..."
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
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl">
          {suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
                <ShoppingBag className="w-3 h-3" />
                Product Suggestions
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {suggestions.map((product) => (
                  <div
                    key={product._id}
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
                        <span className="text-xs font-bold text-primary">
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
              <button 
                onClick={() => onSubmit()}
                className="w-full py-3 px-4 text-center text-xs font-bold text-slate-400 hover:text-primary hover:bg-white/5 border-t border-white/5 transition-all"
              >
                See all results for "{query}"
              </button>
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-50">No product found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

