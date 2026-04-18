"use client";

import React, { useEffect, useState } from "react";
import { X, Store, MapPin, Phone, Mail, Package, CheckCircle2, AtSign, Loader2, AlertCircle, Building, PenSquare, Contact, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import imageCompression from "browser-image-compression";
import { categories as allCategories } from "@/constants/categories";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const categories = allCategories.filter((c) => c.value !== "all");

export const RegisterShopModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    description: "",
    category: "",
    address: "",
    phone: "",
    email: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [usernameStatus, setUsernameStatus] = useState<{ loading: boolean; available: boolean | null; error: string | null }>({
    loading: false,
    available: null,
    error: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Shop name is required";
      else if (formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";
      
      if (!formData.username.trim()) newErrors.username = "Shop handle is required";
      else if (usernameStatus.error) newErrors.username = usernameStatus.error;
      else if (usernameStatus.available === false) newErrors.username = "Username already taken";
    }

    if (currentStep === 2) {
      if (!formData.description.trim()) newErrors.description = "Description is required";
      else if (formData.description.trim().length < 20) newErrors.description = "Description must be at least 20 characters";
      
      if (!formData.category) newErrors.category = "Please select a category";
    }

    if (currentStep === 4) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = "Business email is required";
      else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
      
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (formData.phone.trim().length < 10) newErrors.phone = "Enter a valid phone number";
      
      if (!formData.address.trim()) newErrors.address = "Physical address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setIsLoading(false);
  }, [isOpen]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username) {
        setUsernameStatus({ loading: false, available: null, error: null });
        return;
      }
      if (formData.username.length < 3) {
        setUsernameStatus({ loading: false, available: null, error: "Username too short" });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setUsernameStatus({ loading: false, available: null, error: "Only letters, numbers, and underscores" });
        return;
      }
      setUsernameStatus((prev) => ({ ...prev, loading: true }));
      try {
        const res = await api.get(`/shops/check-username/${formData.username}`);
        const data = res.data;
        setUsernameStatus({ loading: false, available: data.available, error: data.available ? null : "Username already taken" });
      } catch {
        setUsernameStatus({ loading: false, available: null, error: "Error checking availability" });
      }
    };
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.username]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: type === "banner" ? 1920 : 800,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "avatar") {
          setAvatarPreview(reader.result as string);
          setAvatarFile(compressedFile);
        } else {
          setBannerPreview(reader.result as string);
          setBannerFile(compressedFile);
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "avatar") {
          setAvatarPreview(reader.result as string);
          setAvatarFile(file);
        } else {
          setBannerPreview(reader.result as string);
          setBannerFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) {
      toast.error("Please fix the errors before launching your shop.");
      return;
    }
    setIsLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
      if (avatarFile) submitData.append("avatar", avatarFile);
      if (bannerFile) submitData.append("banner", bannerFile);
      const response = await api.post("/shops", submitData, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.data.success) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (userData) {
          userData.accountType = "seller";
          localStorage.setItem("user", JSON.stringify(userData));
        }
        toast.success("Shop registered successfully!");
        onSuccess?.();
      } else {
        throw new Error(response.data.message || "Failed to register shop");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to register shop");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };
  const prevStep = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const steps = [
    { title: "Identity", icon: <Building /> },
    { title: "Details", icon: <PenSquare /> },
    { title: "Branding", icon: <Camera /> },
    { title: "Contact", icon: <Contact /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 border-b border-border shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl grid place-items-center">
              <Store className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground leading-tight">Create Your Shop</h3>
              <p className="text-xs text-muted-foreground font-medium">Follow the steps to get your shop up and running.</p>
            </div>
          </div>
        </div>

        <div className="p-4 pt-3 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="bg-muted/40 p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={i} className={`flex-1 min-w-[80px] text-center px-3 py-2 rounded-lg ${step === i + 1 ? "bg-background shadow-sm" : ""}`}>
                <p className={`text-[11px] font-bold ${step > i + 1 ? "text-primary" : step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Building className="text-primary" /> Shop Identity
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-xs">Shop Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Urban Threads"
                      className={`w-full mt-1.5 px-3 py-2.5 bg-muted/50 border ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all font-medium`}
                    />
                    {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="font-medium text-xs flex justify-between items-center">
                      Shop Handle {usernameStatus.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    </label>
                    <div className="relative mt-1.5">
                      <AtSign
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          usernameStatus.error ? "text-red-500" : usernameStatus.available ? "text-green-500" : "text-muted-foreground"
                        }`}
                      />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="your_shop_handle"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                          errors.username || usernameStatus.error
                            ? "border-red-500 focus:ring-red-500/50"
                            : usernameStatus.available
                            ? "border-green-500 focus:ring-green-500/50"
                            : "border-border focus:ring-primary/50"
                        }`}
                      />
                    </div>
                    {(errors.username || usernameStatus.error) && (
                      <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1 uppercase tracking-tight">
                        <AlertCircle className="w-3 h-3" />
                        {errors.username || usernameStatus.error}
                      </p>
                    )}
                    {usernameStatus.available && (
                      <p className="text-[11px] text-green-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Username is available
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <PenSquare className="text-primary" /> Details & Category
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-xs">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="What makes your shop special?"
                      rows={4}
                      className={`w-full mt-1.5 px-3 py-2.5 bg-muted/50 border ${errors.description ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all font-medium resize-none`}
                    />
                    {errors.description && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.description}</p>}
                  </div>
                  <div>
                    <label className="font-medium text-xs">Category</label>
                    <div className="relative mt-1.5">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2.5 bg-muted/50 border ${errors.category ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all font-medium appearance-none`}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <Package className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.category ? 'text-red-500' : 'text-muted-foreground'} pointer-events-none`} />
                    </div>
                    {errors.category && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.category}</p>}
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Camera className="text-primary" /> Shop Branding
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-xs">Shop Banner</label>
                    <div className="mt-1.5 relative h-28 w-full bg-muted/50 border-2 border-dashed border-border rounded-xl overflow-hidden">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Upload Banner</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "banner")} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Recommended: 1200x400px</p>
                  </div>
                  <div>
                    <label className="font-medium text-xs">Shop Avatar (Logo)</label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative w-20 h-20 bg-muted/50 border-2 border-dashed border-border rounded-2xl overflow-hidden">
                        {avatarPreview ? <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" /> : <div className="absolute inset-0 grid place-items-center text-muted-foreground"><Camera className="w-6 h-6" /></div>}
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "avatar")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Store Profile Photo</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Recommended: 512x512px square image.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Contact className="text-primary" /> Contact Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-xs">Business Email</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="hello@yourshop.com"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all font-medium`}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="font-medium text-xs">Phone Number</label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 700 000 000"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all font-medium`}
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-medium text-xs">Physical Address</label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g., 1st Floor, Garden Plaza"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border ${errors.address ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all font-medium`}
                      />
                    </div>
                    {errors.address && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.address}</p>}
                  </div>
                </div>
              </section>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-border">
              <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-semibold">
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80">
                    Back
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" onClick={nextStep} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow-sm hover:bg-primary/90">
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.category || !formData.username || usernameStatus.available === false}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isLoading ? "Creating..." : "Launch Shop"}
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
