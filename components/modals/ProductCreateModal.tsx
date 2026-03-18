"use client";

import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Layers, Plus, ShoppingBag, PenSquare, Tag, Camera, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { categories as allCategories } from "@/constants/categories";
import imageCompression from "browser-image-compression";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  shopName?: string;
  mode?: "create" | "edit";
  product?: any;
};

const categories = allCategories.filter((c) => c.value !== "all");

const initialFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "1",
};

export const ProductCreateModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onCreated, 
  onUpdated,
  shopName, 
  mode = "create", 
  product 
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (mode === "edit" && product) {
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "",
          stock: product.stock?.toString() || "1",
        });
        setExistingImages(product.images || (product.image ? [product.image] : []));
        setImagePreviews(product.images || (product.image ? [product.image] : []));
      } else {
        resetForm();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, product]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData(initialFormData);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setStep(1);
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

    const remainingSlots = 10 - (imageFiles.length + existingImages.length);
    if (remainingSlots <= 0) {
      toast.error("You can only upload up to 10 images");
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

      setImageFiles((prev) => [...prev, finalFile]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(finalFile);
    });
  };

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    
    if (existingImages.includes(previewToRemove)) {
      setExistingImages((prev) => prev.filter((url) => url !== previewToRemove));
    } else {
      const relativeIndex = imagePreviews.slice(0, index).filter(p => !existingImages.includes(p)).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== relativeIndex));
    }
    
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageFiles.length === 0 && existingImages.length === 0) {
      toast.error("Please select at least one product image");
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
      
      if (mode === "edit") {
        submitData.append("existingImages", JSON.stringify(existingImages));
      }
      
      imageFiles.forEach((file) => {
        submitData.append("image", file);
      });

      let response;
      if (mode === "edit" && product) {
        response = await api.put(`/products/${product.id || product._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/products", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast.success(mode === "edit" ? "Product updated successfully!" : "Product created successfully!");
        resetForm();
        if (mode === "edit") {
          onUpdated?.();
        } else {
          onCreated?.();
        }
        onClose();
      } else {
        throw new Error(response.data.message || `Failed to ${mode} product`);
      }
    } catch (error: any) {
      console.error(`Product ${mode} error:`, error);
      const message = error?.response?.data?.message || error?.message || `An error occurred while ${mode === "edit" ? "updating" : "creating"} the product`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const steps = [
    { title: "Basics", icon: <PenSquare /> },
    { title: "Details", icon: <Tag /> },
    { title: "Media", icon: <Camera /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border max-h-[90vh] flex flex-col animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 border-b border-border shrink-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <button onClick={handleClose} disabled={isSubmitting} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl grid place-items-center shadow-inner">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground leading-tight">
                {mode === "edit" ? "Modify Product" : "Post Product"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {mode === "edit" ? "Updating entry in" : "Listing to"} {shopName || "your shop"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 pt-3 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="bg-muted/40 p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={i} className={`flex-1 min-w-[80px] text-center px-3 py-2 rounded-lg transition-all ${step === i + 1 ? "bg-background shadow-sm scale-[1.02]" : ""}`}>
                <p className={`text-[11px] font-bold ${step > i + 1 ? "text-primary" : step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <PenSquare className="text-primary" /> Basic Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-xs">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Vintage Leather Jacket"
                      disabled={isSubmitting}
                      className="w-full mt-1.5 px-3 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-xs">Category</label>
                    <div className="relative mt-1.5">
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none disabled:opacity-50"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Tag className="text-primary" /> Details & Pricing
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-xs">Description</label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the magic behind this product..."
                      rows={4}
                      disabled={isSubmitting}
                      className="w-full mt-1.5 px-3 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none disabled:opacity-50"
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {formData.description.length}/1000
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-xs">Price (KES)</label>
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
                        className="w-full mt-1.5 px-3 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-xs">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        required
                        min="1"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="1"
                        disabled={isSubmitting}
                        className="w-full mt-1.5 px-3 py-2.5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2"><Camera className="text-primary" /> Product Images</span>
                  <span className="text-xs text-muted-foreground font-normal">{imagePreviews.length}/10 selected</span>
                </h4>
                <div className="space-y-4">
                  {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group bg-muted border border-border rounded-xl overflow-hidden aspect-square">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isSubmitting}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.length < 10 && (
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="mt-1.5 relative h-32 w-full bg-muted/50 border-2 border-dashed border-border rounded-xl overflow-hidden">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Upload Images</span>
                        </div>
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isSubmitting} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-center">Weighs less than 5MB per image. Max 10 images.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-border">
              <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-semibold disabled:opacity-50">
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button type="button" onClick={prevStep} disabled={isSubmitting} className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 disabled:opacity-50">
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={
                      (step === 1 && (!formData.name.trim() || !formData.category)) ||
                      (step === 2 && (!formData.description.trim() || !formData.price || !formData.stock))
                    } 
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || imagePreviews.length === 0}
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : (mode === "edit" ? "Update Details" : "Publish")}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreateModal;
