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
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Package,
  AlertCircle,
  Loader2,
  X,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
  Tag,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { categories as allCategories } from "@/constants/categories";
import ProductCreateModal from "@/components/ProductCreateModal";


const categories = allCategories.filter(c => c.value !== 'all');

const SellerProductsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [shop, setShop] = useState<any>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "1",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth?mode=login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.accountType !== "seller") {
        router.push("/account");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1";
      
      // Fetch shop info first
      const shopRes = await api.get("/shops/my-shop");
      if (shopRes.data.success && shopRes.data.data) {
        setShop(shopRes.data.data);
      } else {
        router.push("/account/seller");
        setIsLoading(false);
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
      if (e.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/auth?mode=login");
        return;
      }
      console.error("Error fetching data:", e);
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
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 3 - imageFiles.length;
    if (remainingSlots <= 0) {
      toast.error("You can only upload up to 3 images");
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
      setImageFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (imageFiles.length === 0) {
      toast.error("Please select at least one product image");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("content", formData.description);
      submitData.append("price", formData.price);
      submitData.append("category", formData.category);
      submitData.append("stock", formData.stock);
      
      imageFiles.forEach(file => {
        submitData.append("image", file);
      });

      const response = await api.post("/products", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Product listed successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchProducts(); // Refresh the list
      } else {
        throw new Error(response.data.message || "Failed to post product");
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      const message = err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "1",
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(productId);

    try {
      const res = await api.delete(`/products/${productId}`);

      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        toast.success("Product deleted successfully");
      } else {
        toast.error(res.data.message || "Failed to delete product");
      }
    } catch (e: any) {
      console.error("Error deleting product:", e);
      const message = e.response?.data?.message || e.message || "An error occurred while deleting the product";
      toast.error(message);
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/account/seller" 
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground border border-border"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-foreground uppercase tracking-tight">My Products</h2>
            <p className="text-muted-foreground font-medium">Manage your store inventory.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>ADD PRODUCT</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search products by name or category..."
              className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-background border border-border rounded-2xl font-bold text-muted-foreground hover:bg-muted transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-background rounded-3xl border border-border p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
              {searchQuery ? "Try adjusting your search filters." : "You haven't added any products to your shop yet."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>CREATE PRODUCT</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product: any) => (
              <div 
                key={product._id}
                className="bg-background rounded-2xl border border-border p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Image */}
                <div className="w-full md:w-32 aspect-square rounded-xl overflow-hidden bg-muted shrink-0 relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-primary-foreground text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                      Low Stock
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-foreground text-[10px] font-black px-3 py-1 border-2 border-foreground rounded-lg uppercase">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">
                      {product.category || "General"}
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      ID: {product._id.slice(-6)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground truncate mb-1 uppercase tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <p className="text-xl font-bold text-foreground">
                      KES {product.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Package className={`w-4 h-4 ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-bold ${product.stock > 0 ? 'text-muted-foreground' : 'text-red-500'}`}>
                        {product.stock} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  <Link 
                    href={`/account/seller/products/edit/${product._id}`}
                    className="flex-1 md:flex-none p-4 md:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span className="md:hidden">Edit</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    disabled={isDeleting === product._id}
                    className="flex-1 md:flex-none p-4 md:p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"
                  >
                    {isDeleting === product._id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    <span className="md:hidden">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
          shopName={shop?.name || "Your Shop"}
        />
      )}
      {false && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-background rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-border">
            <div className="relative p-6 border-b border-border shrink-0">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold leading-tight">
                Create Listing
              </h3>
              <p className="text-muted-foreground text-xs font-medium mt-1">
                Drafting in {shop?.name || "Your Shop"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-8 items-start">
                {/* Form Column */}
                <form onSubmit={handleSubmit} className="w-full space-y-8">
                  <div className="space-y-8">
                    {/* Image Upload Area */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between ml-2">
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                          Product Media ({imageFiles.length}/3)
                        </label>
                        {imageFiles.length < 3 && imageFiles.length > 0 && (
                          <label className="text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline">
                            Add more
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {imagePreviews.length > 0 ? (
                        <div
                          className={`grid gap-2 rounded-2xl overflow-hidden ${
                            imagePreviews.length === 1
                              ? "grid-cols-1"
                              : imagePreviews.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-2"
                          }`}
                        >
                          {imagePreviews.map((preview, index) => (
                            <div
                              key={index}
                              className={`relative group bg-muted border border-border overflow-hidden ${
                                imagePreviews.length === 3 && index === 0
                                  ? "row-span-2 h-full"
                                  : "aspect-square"
                              }`}
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="w-8 h-8 bg-black/50 hover:bg-red-500 text-primary-foreground rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border rounded-2xl bg-muted hover:bg-background hover:border-primary/30 transition-all cursor-pointer group">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <div className="w-16 h-16 bg-background rounded-3xl shadow-sm border border-border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500">
                            <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-xs font-black text-foreground uppercase tracking-widest">
                            Click to upload photos
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
                            Up to 3 high quality JPG, PNG or WebP
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Text Fields */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
                          Product Details
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          autoFocus
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Give your item a catchy name..."
                          className="w-full px-6 py-5 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50 text-lg"
                        />
                        <textarea
                          name="description"
                          required
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the magic behind this product..."
                          rows={4}
                          className="w-full px-6 py-5 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50 resize-none min-h-[160px] leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
                            Category
                          </label>
                          <div className="relative group">
                            <select
                              name="category"
                              required
                              value={formData.category}
                              onChange={handleInputChange}
                              className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground appearance-none cursor-pointer"
                            >
                              <option value="">Select category</option>
                              {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <Layers className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
                              Price (KES)
                            </label>
                            <input
                              type="number"
                              name="price"
                              required
                              value={formData.price}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
                              Stock
                            </label>
                            <input
                              type="number"
                              name="stock"
                              required
                              value={formData.stock}
                              onChange={handleInputChange}
                              placeholder="1"
                              className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 pt-8 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting || !formData.name || imageFiles.length === 0
                      }
                      className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 flex items-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Post Listing</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Preview removed */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SellerProductsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    }>
      <SellerProductsContent />
    </Suspense>
  );
};

export default SellerProductsPage;
