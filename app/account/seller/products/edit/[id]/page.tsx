"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  DollarSign, 
  Info,
  ChevronLeft,
  ImageIcon,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { categories as allCategories } from "@/constants/categories";
import imageCompression from "browser-image-compression";

const categories = allCategories.filter(c => c.value !== 'all');

const EditProductPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    sizes: "",
    colors: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data;
        
        if (data.success && data.data) {
          const product = data.data;
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : (product.sizes || ""),
            colors: Array.isArray(product.colors) ? product.colors.join(", ") : (product.colors || ""),
          });
          if (product.images && Array.isArray(product.images)) {
            setImagePreviews(product.images);
          } else if (product.image) {
            setImagePreviews([product.image]);
          }
        } else {
          toast.error("Product not found");
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          router.push("/auth?mode=login");
          return;
        }
        console.error("Error fetching product:", err);
        toast.error("Failed to load product data");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 10 - imagePreviews.length;
    if (remainingSlots <= 0) {
      toast.error("You can only upload up to 10 images");
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach(async (file) => {
      let finalFile = file;

      // Compress image
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
      } catch (err) {
        console.error("Compression failed", err);
      }

      setImageFiles(prev => [...prev, finalFile]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(finalFile);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("content", formData.description);
      submitData.append("price", formData.price);
      submitData.append("category", formData.category);
      submitData.append("stock", formData.stock);
      submitData.append("sizes", formData.sizes);
      submitData.append("colors", formData.colors);
      
      // Handle images
      imageFiles.forEach(file => {
        submitData.append("image", file);
      });

      // Send existing media
      const existingImages = imagePreviews.filter(p => !p.startsWith('data:'));
      submitData.append("existingImages", JSON.stringify(existingImages));

      const response = await api.put(`/products/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Product updated successfully!");
        router.push("/account/seller/products");
      } else {
        throw new Error(response.data.message || "Failed to update product");
      }
    } catch (err: any) {
      console.error("Error updating product:", err);
      const message = err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Products
      </button>

      <div className="bg-background rounded-3xl shadow-xl shadow-primary/5 border border-border overflow-hidden">
        <div className="bg-foreground p-8 text-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-black tracking-tight uppercase">Edit Product</h1>
            <p className="text-background/60 font-medium mt-1">Update your product information and media.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <Info className="w-5 h-5 text-primary" />
                  Product Information
                </h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Category</label>
                    <div className="relative">
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none text-foreground"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Price (KES)</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground group-focus-within:text-primary transition-colors">KES</span>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Sizes (Optional)</label>
                    <input
                      type="text"
                      name="sizes"
                      value={formData.sizes}
                      onChange={handleInputChange}
                      placeholder="e.g. S, M, L, XL"
                      className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground ml-2 font-medium">Separate sizes with commas</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Colors (Optional)</label>
                    <input
                      type="text"
                      name="colors"
                      value={formData.colors}
                      onChange={handleInputChange}
                      placeholder="e.g. Red, Blue, Black"
                      className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground ml-2 font-medium">Separate colors with commas</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Product Description</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-6 md:col-span-2 pt-4 border-t border-border">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Product Media ({imagePreviews.length}/10 Images)
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Render Images */}
                    {imagePreviews.map((preview, index) => (
                      <div key={`img-${index}`} className="relative group rounded-2xl overflow-hidden border-2 border-border bg-muted aspect-square">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {!preview.startsWith('data:') && (
                          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md z-10">
                            <p className="text-[8px] font-black text-foreground uppercase tracking-widest">Saved</p>
                          </div>
                        )}
                        {preview.startsWith('data:') && (
                          <div className="absolute bottom-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md z-10">
                            <p className="text-[8px] font-black text-white uppercase tracking-widest">New</p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {imagePreviews.length < 10 && (
                      <label className="relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-2xl bg-muted hover:bg-background hover:border-primary/30 transition-all cursor-pointer group">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="w-10 h-10 bg-background rounded-xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-[10px] font-black text-foreground uppercase text-center">Add Photo<br/><span className="text-muted-foreground font-medium normal-case tracking-tight">max 10</span></p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

                <div className="flex items-center justify-between gap-6 pt-8 border-t border-border">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="px-8 py-4 bg-muted text-muted-foreground rounded-[2rem] font-bold hover:bg-muted/80 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground px-10 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 flex items-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Update Product</span>
                      </>
                    )}
                  </button>
                </div>
          </form>
        </div>
      </div>
  );
};

export default EditProductPage;
