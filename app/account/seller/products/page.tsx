"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  Plus, 
  ArrowLeft,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Layers,
  Zap,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { ProductCreateModal } from "@/components/ProductCreateModal";

const SellerProductsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [shop, setShop] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProducts = async () => {
    try {
      // Fetch shop info first
      const shopRes = await api.get("/shops/my-shop");
      if (shopRes.data.success && shopRes.data.data) {
        setShop(shopRes.data.data);
      } else {
        router.push("/account/seller");
        return;
      }

      // Fetch products
      const res = await api.get("/products/my-products");

      if (res.data.success) {
        const mappedProducts = (res.data.data || []).map((p: any) => ({
          ...p,
          _id: p.id || p._id || `prod-${Math.random()}`
        }));
        setProducts(mappedProducts);
      }
    } catch (e: any) {
      console.error("Error fetching data:", e);
      if (e.response?.status === 401) {
        router.push("/auth?mode=login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [router]);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowCreateModal(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setIsDeleting(productId);

    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        toast.success("Product digital footprint erased");
      } else {
        toast.error(res.data.message || "Failed to delete product");
      }
    } catch (e: any) {
      console.error("Error deleting product:", e);
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin-slow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Immersive Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/account/seller" 
            className="p-4 hover:bg-background/60 backdrop-blur-3xl rounded-3xl transition-all text-muted-foreground hover:text-foreground border border-border shadow-sm dark:border-border/50 shadow-xl group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">Your Products</h1>
            <p className="text-muted-foreground font-medium text-lg">Manage your digital assets and stock levels.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-[2rem] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 uppercase tracking-[0.2em]"
        >
          <Plus className="w-6 h-6" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="space-y-10">
        {/* Search and Filters Hub */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Query product name or category..."
              className="w-full pl-16 pr-8 py-6 bg-background/40 backdrop-blur-3xl border border-border shadow-sm dark:border-border/50 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-black text-lg text-foreground placeholder:text-muted-foreground/30 shadow-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-background/20 backdrop-blur-3xl rounded-[4rem] border-2 border-dashed border-border shadow-sm p-24 text-center shadow-2xl transition-all hover:bg-white/[0.02] hover:border-border">
            <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 ring-4 ring-white/5">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/20" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">Digital Shelf Empty</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium text-lg leading-relaxed">
              {searchQuery ? "Your search parameters returned no matches." : "Start populating your storefront with elite products."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-foreground/20"
              >
                <Plus className="w-6 h-6" />
                <span>Initialize Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.map((product: any) => (
              <div 
                key={product._id}
                className="group relative overflow-hidden bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:border-primary/20 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                {/* Visual Asset */}
                <div className="w-full md:w-48 aspect-square rounded-[2rem] overflow-hidden bg-muted/30 shrink-0 relative shadow-2xl border border-border shadow-sm">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Scarcity Limit
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
                      <span className="text-foreground text-[10px] font-black px-4 py-2 border-2 border-foreground rounded-[1.25rem] uppercase tracking-widest text-center leading-none">
                        Depleted
                      </span>
                    </div>
                  )}
                </div>

                {/* Cognitive Data */}
                <div className="flex-1 min-w-0 text-center md:text-left space-y-4">
                  <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      <Tag className="w-3 h-3" />
                      {product.category || "Uncategorized"}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                      REF: {product._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter leading-tight italic truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-8 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-muted-foreground uppercase mr-1 opacity-50 italic">KES</span>
                      <p className="text-3xl font-black text-primary tracking-tighter italic">
                        {product.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-background/40 rounded-2xl border border-border/50 shadow-inner">
                      <Package className={`w-5 h-5 ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-black uppercase tracking-widest ${product.stock > 0 ? 'text-muted-foreground' : 'text-red-500'}`}>
                        {product.stock} Units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terminal Actions */}
                <div className="flex items-center gap-4 w-full md:w-auto md:border-l border-border shadow-sm md:pl-8">
                  <Link 
                    href={`/account/seller/products/edit/${product._id}`}
                    className="flex-1 md:flex-none p-5 bg-background shadow-xl border border-border shadow-sm text-primary rounded-[1.5rem] hover:bg-primary hover:text-white transition-all duration-500 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span className="md:hidden">Modify</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    disabled={isDeleting === product._id}
                    className="flex-1 md:flex-none p-5 bg-background shadow-xl border border-border shadow-sm text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {isDeleting === product._id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    <span className="md:hidden">Purge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          fetchProducts();
        }}
        shopName={shop?.name || "Your Shop"}
      />
    </div>
  );
};

const SellerProductsPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin-slow"></div>
        </div>
      </div>
    }>
      <SellerProductsContent />
    </Suspense>
  );
};

export default SellerProductsPage;
