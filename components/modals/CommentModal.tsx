"use client";

import React, { useState } from "react";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onCommentAdded?: () => void;
}

const CommentModal = ({ isOpen, onClose, productId, productName, onCommentAdded }: CommentModalProps) => {
  const [content, setContent] = useState("");
  const { createComment, isPosting } = useComments(productId);
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to post a comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    createComment(
      { productId, content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
          onClose();
          if (onCommentAdded) onCommentAdded();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Add Comment</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{productName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">
              Your Comment
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you think about this product?"
              className="w-full h-32 px-4 py-3 bg-muted border border-border rounded-2xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none outline-none placeholder:text-muted-foreground/50"
              autoFocus
            />
            <p className="mt-2 text-[10px] text-muted-foreground text-right">
              {content.length}/1000 characters
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-border text-muted-foreground rounded-xl font-bold hover:bg-muted transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPosting || !content.trim()}
              className="flex-[2] px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post Comment
            </button>
          </div>
        </form>

        {/* Footer info */}
        {!user && (
          <div className="px-6 py-4 bg-amber-500/10 border-t border-amber-500/20">
            <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
              You must be <a href="/auth" className="font-bold underline">logged in</a> to post a comment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
