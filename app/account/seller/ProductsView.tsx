"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  Plus, 
  ArrowLeft,
  Search,
  Edit2,
  Trash2,
  Package,
  Loader2,
  Tag,
  Star,
  MessageCircle,
  Repeat2,
  Heart,
  Share2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { ProductCreateModal } from "@/components/modals/ProductCreateModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { ProductFeedCard } from "@/components/shop/ProductFeedCard";
import FeedbackModal from "@/components/modals/FeedbackModal";
import { UniversalShareModal } from "@/components/modals/UniversalShareModal";
import CommentModal from "@/components/modals/CommentModal";
import ChoiceModal from "@/components/modals/ChoiceModal";

export const ProductsView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [shop, setShop] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Feed auxiliary states
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, productId: "", productName: "", initialRating: 0 });
  const [commentModal, setCommentModal] = useState({ isOpen: false, productId: "", productName: "" });
  const [shareModal, setShareModal] = useState({ isOpen: false, url: "", title: "" });
  const [repostPopover, setRepostPopover] = useState<{ isOpen: boolean; productId: string | null; position: { top: number; left: number } }>({ isOpen: false, productId: null, position: { top: 0, left: 0 } });

  const fetchProducts = async () => {
    try {
      const shopRes = await api.get("/shops/my-shop");
      if (shopRes.data.success && shopRes.data.data) {
        setShop(shopRes.data.data);
      } else {
        router.push("/account/seller");
        return;
      }

      const res = await api.get("/products/my-products");

      if (res.data.success) {
        const mappedProducts = (res.data.data || []).map((p: any) => ({
          ...p,
          _id: p.id || p._id,
          name: p.name || "Untitled Product",
          price: Number(p.price || 0),
          description: p.description || "",
          image: p.image || p.images?.[0] || null,
          commentsCount: p.commentsCount || p.comments?.length || 0,
          reposts: p.reposts || 0,
          averageRating: p.averageRating || p.rating || 0,
          shop: shopRes.data.data
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
    }
  }, [searchParams]);

  const handleDelete = async (productId: string) => {
    setProductToDelete(productId);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const productId = productToDelete;
    setIsDeleting(productId);

    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        toast.success("Product deleted");
      } else {
        toast.error(res.data.message || "Failed to delete product");
      }
    } catch (e: any) {
      console.error("Error deleting product:", e);
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(null);
      setProductToDelete(null);
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
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/account/seller?view=overview" 
            className="p-4  backdrop-blur-3xl rounded-3xl transition-all text-muted-foreground  border border-border shadow-sm dark:border-border/50 shadow-xl group"
          >
            <ArrowLeft className="w-6 h-6 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">Your products</h1>
            <p className="text-muted-foreground font-medium text-lg">Manage your storefront items and stock levels.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-[2rem] font-black text-sm   transition-all shadow-2xl shadow-primary/30"
        >
          <Plus className="w-6 h-6" />
          <span>Add product</span>
        </button>
      </div>

      <div className="space-y-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 transition-opacity duration-700" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search products by name or category..."
              className="w-full pl-16 pr-8 py-6 bg-background/40 backdrop-blur-3xl border border-border shadow-sm dark:border-border/50 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-black text-lg text-foreground placeholder:text-muted-foreground/30 shadow-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-background/20 backdrop-blur-3xl rounded-[4rem] border-2 border-dashed border-border shadow-sm p-24 text-center shadow-2xl transition-all  ">
            <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 ring-4 ring-white/5">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/20" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">No products found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium text-lg leading-relaxed">
              {searchQuery ? "Your search returned no matches." : "Start populating your storefront with products."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-[2.5rem] font-black text-sm   transition-all shadow-2xl shadow-foreground/20"
              >
                <Plus className="w-6 h-6" />
                <span>Add product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border overflow-hidden">
            {filteredProducts.map((product: any) => (
              <div key={product._id} className="relative group">
                <ProductFeedCard
                  product={{ ...product, shop: shop }}
                  isInWishlist={(id) => wishlist.includes(id)}
                  repostPopover={repostPopover}
                  onProductClick={(p) => {
                    setEditingProduct(p);
                    setShowCreateModal(true);
                  }}
                  onAddToCart={(e, p) => toast.info("Viewing as seller")}
                  onWishlist={(e, p) => {
                    e.stopPropagation();
                    const id = p._id || p.id;
                    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                  }}
                  onRatingOpen={(productId, productName, initialRating) => setRatingModal({ isOpen: true, productId, productName, initialRating })}
                  onCommentOpen={(productId, productName) => setCommentModal({ isOpen: true, productId, productName })}
                  onRepostToggle={(e, productId) => {
                    e.stopPropagation();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setRepostPopover({
                      isOpen: repostPopover.productId !== productId,
                      productId: productId,
                      position: { top: rect.bottom + window.scrollY + 5, left: rect.right + window.scrollX - 100 },
                    });
                  }}
                  onShareOpen={(url, title) => setShareModal({ isOpen: true, url, title })}
                />
                
                {/* Admin Actions Overlay */}
                <div className="absolute top-4 right-14 flex gap-2 opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product);
                      setShowCreateModal(true);
                    }}
                    className="p-2 bg-background/80 backdrop-blur-md rounded-full border border-border transition-all shadow-lg"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id);
                    }}
                    className="p-2 bg-background/80 backdrop-blur-md rounded-full border border-border transition-all shadow-lg text-red-500"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductCreateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
        }}
        mode={editingProduct ? "edit" : "create"}
        product={editingProduct}
        onCreated={() => {
          setShowCreateModal(false);
          fetchProducts();
        }}
        onUpdated={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
          fetchProducts();
        }}
        shopName={shop?.name || "Your Shop"}
      />

      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete product?"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        icon={Trash2}
        isLoading={!!isDeleting}
      />

      {/* Feed Interaction Modals */}
      <FeedbackModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
        id={ratingModal.productId}
        name={ratingModal.productName}
        type="product"
      />
      <UniversalShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
        url={shareModal.url}
        title={shareModal.title}
        type="product"
      />
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
        productId={commentModal.productId}
        productName={commentModal.productName}
      />
      {repostPopover.isOpen && (
        <ChoiceModal
          isOpen={repostPopover.isOpen}
          onClose={() => setRepostPopover({ isOpen: false, productId: null, position: { top: 0, left: 0 } })}
          layout="popover"
          position={repostPopover.position}
          items={[
            { id: "repost", label: "Repost", icon: Repeat2, onClick: () => toast.success("Reposted to your feed") },
            { id: "resell", label: "Resell", icon: ShoppingCart, onClick: () => toast.success("Added to your resell list") },
          ]}
        />
      )}
    </div>
  );
};
