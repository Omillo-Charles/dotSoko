"use client";

import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Loader2, Send, Camera, Film } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import imageCompression from "browser-image-compression";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export const CreateUpdateModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setCaption("");
    setMediaFile(null);
    setMediaPreview("");
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

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md bg-background rounded-[2.5rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black leading-tight">Post Update</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Share with your followers</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
              Media
            </label>
            
            {mediaPreview ? (
              <div className="relative aspect-[9/16] max-h-[400px] w-full bg-muted rounded-3xl overflow-hidden group border border-border">
                {mediaFile?.type.startsWith("video/") ? (
                  <video src={mediaPreview} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                {!isSubmitting && (
                  <button 
                    onClick={() => { setMediaFile(null); setMediaPreview(""); }}
                    className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:bg-red-500 hover:text-white transition-all shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-border rounded-[2rem] bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4 group"
              >
                <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Film className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight">Choice Media</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-1">Tap to select photo or video</p>
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
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
              Caption
            </label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium text-foreground resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !mediaFile}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Share Update</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
