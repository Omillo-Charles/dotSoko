"use client";

import React, { useState } from "react";
import { X, Image as ImageIcon, Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { categories as allCategories } from "@/constants/categories";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  shopName?: string;
};

const categories = allCategories.filter((c) => c.value !== "all");

const initialFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "1",
};

export const ProductCreateModal: React.FC<Props> = ({ isOpen, onClose, onCreated, shopName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData(initialFormData);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = filesToAdd.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPG, PNG, or WebP images");
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = filesToAdd.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    filesToAdd.forEach((file) => {
      setImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (imageFiles.length === 0) {
      toast.error("Please select at least one product image");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a product description");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 1) {
      toast.error("Stock must be at least 1");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("content", formData.description.trim());
      submitData.append("price", formData.price);
      submitData.append("category", formData.category);
      submitData.append("stock", formData.stock);
      
      imageFiles.forEach((file) => {
        submitData.append("image", file);
      });

      const response = await api.post("/products", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Product created successfully!");
        resetForm();
        onCreated?.();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Product creation error:", error);
      const message = error?.response?.data?.message || error?.message || "An error occurred while creating the product";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-background rounded-[2.5rem] shadow-2xl overflow-hidden border border-border animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-border shrink-0">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold leading-tight text-foreground">Create Listing</h3>
          <p className="text-muted-foreground text-xs font-medium mt-1">Drafting in {shopName || "Your Shop"}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            {/* Product Media */}
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
                      accept="image/jpeg,image/jpg,image/png,image/webp" 
                      multiple 
                      onChange={handleImageChange} 
                      className="hidden" 
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>
              
              {imagePreviews.length > 0 ? (
                <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                  imagePreviews.length === 1 
                    ? "grid-cols-1" 
                    : imagePreviews.length === 2 
                    ? "grid-cols-2" 
                    : "grid-cols-2"
                }`}>
                  {imagePreviews.map((preview, index) => (
                    <div 
                      key={index} 
                      className={`relative group bg-muted border border-border overflow-hidden rounded-xl ${
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
                          disabled={isSubmitting}
                          className="w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 text-primary-foreground text-[9px] font-black uppercase tracking-wider rounded-lg backdrop-blur-sm">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border rounded-2xl bg-muted hover:bg-background hover:border-primary/30 transition-all cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    multiple 
                    onChange={handleImageChange} 
                    className="hidden" 
                    disabled={isSubmitting}
                  />
                  <div className="w-16 h-16 bg-background rounded-3xl shadow-sm border border-border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500">
                    <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-xs font-black text-foreground uppercase tracking-widest">Click to upload photos</span>
                  <span className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">Up to 3 high quality JPG, PNG or WebP (max 5MB each)</span>
                </label>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Product Details</label>
                <input
                  type="text"
                  name="name"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Give your item a catchy name..."
                  disabled={isSubmitting}
                  maxLength={100}
                  className="w-full px-6 py-5 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the magic behind this product..."
                  rows={4}
                  disabled={isSubmitting}
                  maxLength={1000}
                  className="w-full px-6 py-5 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50 resize-none min-h-[160px] leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>

              {/* Category, Price, Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Category</label>
                  <div className="relative group">
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Price (KES)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="1"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="1"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="1"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-background transition-all font-bold text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-6 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.description.trim() || !formData.category || imageFiles.length === 0}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-primary/90 active:scale-95 inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
        </div>
      </div>
    </div>
  );
};

export default ProductCreateModal;
