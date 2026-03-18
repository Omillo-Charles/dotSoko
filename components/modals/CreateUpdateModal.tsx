"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Loader2, Send, Camera, Film, ChevronRight, CheckCircle2, PenSquare } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import imageCompression from "browser-image-compression";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export const CreateUpdateModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setCaption("");
    setMediaFile(null);
    setMediaPreview("");
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Please upload an image or video");
      return;
    }

    // Limit video size (ImageKit free tier has limits, and user experience)
    if (isVideo && file.size > 10 * 1024 * 1024) {
      toast.error("Video must be under 10MB");
      return;
    }

    let finalFile = file;
    if (isImage) {
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
    }

    setMediaFile(finalFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(finalFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      toast.error("Please select an image or video for your update");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("media", mediaFile);
      formData.append("caption", caption);

      const response = await api.post("/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Update posted successfully!");
        onCreated?.();
        handleClose();
      } else {
        throw new Error(response.data.message || "Failed to post update");
      }
    } catch (err: any) {
      console.error("Error creating update:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to post update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const steps = [
    { title: "Media", icon: <Film /> },
    { title: "Details", icon: <PenSquare /> },
  ];

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div 
        className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border max-h-[90vh] flex flex-col animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-border shrink-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5">
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl grid place-items-center">
              <Camera className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground leading-tight">Post Update</h3>
              <p className="text-xs text-muted-foreground font-medium">Share your shop's latest story.</p>
            </div>
          </div>
        </div>

        {/* Tab Indicators */}
        <div className="px-6 pt-4 shrink-0">
          <div className="bg-muted/40 p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={i} className={`flex-1 min-w-[80px] text-center px-3 py-2 rounded-lg transition-all ${step === i + 1 ? "bg-background shadow-sm scale-[1.02]" : ""}`}>
                <p className={`text-[11px] font-bold ${step > i + 1 ? "text-indigo-500" : step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-3 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
            {step === 1 && (
              <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Film className="text-indigo-500" /> Choose Media
                </h4>
                
                {mediaPreview ? (
                  <div className="relative aspect-[9/16] max-h-[400px] w-full bg-muted rounded-3xl overflow-hidden group border border-border shadow-inner">
                    {mediaFile?.type.startsWith("video/") ? (
                      <video src={mediaPreview} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    {!isSubmitting && (
                      <button 
                        type="button"
                        onClick={() => { setMediaFile(null); setMediaPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-border rounded-[2.5rem] bg-muted/30 hover:bg-muted/50 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border border-border flex items-center justify-center group-hover:scale-110 group-hover:shadow-indigo-500/10 group-hover:shadow-xl transition-all duration-500">
                      <ImageIcon className="w-6 h-6 text-indigo-500/60" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">Choice Media</p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Tap to select photo or video</p>
                    </div>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </section>
            )}

            {step === 2 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <PenSquare className="text-indigo-500" /> Story Details
                </h4>

                {mediaPreview && (
                  <div className="flex items-center gap-4 p-3 bg-muted/30 border border-border rounded-2xl shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                      {mediaFile?.type.startsWith("video/") ? (
                        <div className="w-full h-full bg-black flex items-center justify-center"><Film className="w-4 h-4 text-white" /></div>
                      ) : (
                        <img src={mediaPreview} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Media Selected</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Ready to share</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 flex-1 flex flex-col">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
                    Caption
                  </label>
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tell the magic behind this story..."
                    className="w-full h-40 px-5 py-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all font-medium text-foreground resize-none text-sm shadow-inner"
                  />
                  <div className="flex justify-end pr-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {caption.length}/500
                    </span>
                  </div>
                </div>
              </section>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 pt-3 border-t border-border shrink-0">
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={isSubmitting} 
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest text-xs disabled:opacity-50"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  disabled={isSubmitting} 
                  className="px-6 py-2.5 bg-muted text-foreground rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-muted/80 disabled:opacity-50 transition-all"
                >
                  Back
                </button>
              )}
              {step < 2 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!mediaPreview} 
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !mediaFile}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? "Posting..." : "Share Story"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
