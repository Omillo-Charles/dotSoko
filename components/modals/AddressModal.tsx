"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, User, Home, Briefcase, Globe, Phone, CheckCircle2, Loader2, ChevronRight, Check, Tag } from "lucide-react";
import { Address } from "@/hooks/useAddresses";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Address | null;
  mode?: "create" | "edit";
};

const addressTypes = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "other", label: "Other", icon: Globe },
];

export const AddressModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "home" as "home" | "work" | "other",
    city: "",
    street: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      else if (formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";
      
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (formData.phone.trim().length < 10) newErrors.phone = "Enter a valid phone number";
    }

    if (currentStep === 3) {
      if (!formData.city.trim()) newErrors.city = "City / Region is required";
      if (!formData.street.trim()) newErrors.street = "Street / Building is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          phone: initialData.phone || "",
          type: initialData.type || "home",
          city: initialData.city || "",
          street: initialData.street || "",
          isDefault: initialData.isDefault || false,
        });
      } else {
        setFormData({
          name: "",
          phone: "",
          type: "home",
          city: "",
          street: "",
          isDefault: false,
        });
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Address submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };
  const prevStep = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const steps = [
    { id: 1, title: "IDENTITY" },
    { id: 2, title: "TYPE" },
    { id: 3, title: "LOCATION" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border max-h-[90vh] flex flex-col animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Matching Shop Modal */}
        <div className="relative p-6 border-b border-border shrink-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <button onClick={onClose} disabled={isSubmitting} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl grid place-items-center shadow-inner">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground leading-tight">
                {mode === "edit" ? "Modify Address" : "Add Address"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {mode === "edit" ? "Update your delivery location" : "Specify a new delivery spot"}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Matching Shop Modal Structure */}
        <div className="p-4 pt-3 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Tabs */}
          <div className="bg-muted/40 p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto">
            {steps.map((s) => (
              <button 
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id === 2 && !formData.name) return;
                  if (s.id === 3 && (!formData.name || !formData.phone)) return;
                  setStep(s.id);
                }}
                className={`flex-1 min-w-[80px] text-center px-3 py-2 rounded-lg transition-all ${step === s.id ? "bg-background shadow-sm scale-[1.02]" : ""}`}
              >
                <p className={`text-[11px] font-bold ${step === s.id ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <User className="text-primary w-5 h-5" /> Identity Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-xs">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className={`w-full mt-1.5 px-3 py-2.5 bg-muted/50 border ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm font-medium`}
                    />
                    {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.name}</p>}
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
                        placeholder="+254 XXX XXX XXX"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm font-medium`}
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Tag className="text-primary w-5 h-5" /> Address Type
                </h4>
                <div className="space-y-3">
                  <label className="font-medium text-xs">Where are we delivering to?</label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {addressTypes.map((t) => {
                      const Icon = t.icon;
                      const isActive = formData.type === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: t.value as any }))}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            isActive 
                              ? "bg-primary/10 border-primary text-primary shadow-sm scale-[1.05]" 
                              : "bg-muted/20 border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold tracking-tighter">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="text-primary w-5 h-5" /> Location Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-xs">City / Region</label>
                    <div className="relative mt-1.5">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Nairobi"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border ${errors.city ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm font-medium`}
                      />
                    </div>
                    {errors.city && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="font-medium text-xs">Street / Apartment / Building</label>
                    <div className="relative mt-1.5">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="e.g. Kilimani, Galana Rd"
                        className={`w-full pl-9 pr-3 py-2.5 bg-muted/50 border ${errors.street ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm font-medium`}
                      />
                    </div>
                    {errors.street && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1">{errors.street}</p>}
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-muted/20 border border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-all group mt-2">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.isDefault ? 'bg-primary border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}>
                      {formData.isDefault && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-none">Set as primary address</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">Use this for all future checkouts</p>
                    </div>
                  </label>
                </div>
              </section>
            )}

            {/* Footer Buttons - Matching Shop Modal */}
            <div className="pt-3 flex items-center justify-between border-t border-border">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-semibold disabled:opacity-50">
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
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSubmitting ? "Saving..." : mode === "edit" ? "Update" : "Confirm"}
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
