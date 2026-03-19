"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Eye, 
  EyeOff, 
  Key,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useSecurity } from "@/hooks/useSecurity";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { toast } from "sonner";

export const SecurityView = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [confirmAction, setConfirmAction] = useState<"password" | "delete" | null>(null);
  
  const { changePassword, deleteAccount } = useSecurity();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    setConfirmAction("password");
  };

  const handleDeleteClick = () => {
    setConfirmAction("delete");
  };

  const handleConfirm = async () => {
    if (confirmAction === "password") {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
    } else if (confirmAction === "delete") {
      await deleteAccount.mutateAsync();
    }
    setConfirmAction(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link 
            href="/account?view=overview" 
            className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-border group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Security</h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               Manage your password and account security settings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        
        {/* Password Update Section */}
        <div className="bg-background/40 backdrop-blur-3xl border border-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Key className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Update Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Current password</label>
                        <div className="relative">
                            <input 
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                                placeholder="••••••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">New password</label>
                        <div className="relative">
                            <input 
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                                placeholder="••••••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit"
                        disabled={changePassword.isPending}
                        className="w-full bg-foreground text-background py-4 rounded-2xl font-bold text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {changePassword.isPending ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </form>
        </div>

        {/* Security Meta & Dangerous Actions */}
        <div className="space-y-8">
            
            {/* Security Status */}
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold tracking-tight">Security Status</h3>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Security is active</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-white/5 text-[10px] font-bold">
                        <span className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest underline underline-offset-4 decoration-primary/20">2FA Status</span>
                        <span className="text-primary">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-white/5 text-[10px] font-bold">
                        <span className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest underline underline-offset-4 decoration-primary/20">Last Updated</span>
                        <span className="text-foreground">Just now</span>
                    </div>
                </div>

                <p className="text-muted-foreground text-xs font-medium leading-relaxed opacity-80">
                    Your account is currently protected by our secure systems. Your data is encrypted and safe.
                </p>
            </div>

            {/* Account Deletion */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 space-y-4 hover:bg-rose-500/10 transition-all duration-500 group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:rotate-12 transition-transform">
                        <Trash2 className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-rose-500">Delete Account</h3>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest opacity-60">Irreversible action</p>
                    </div>
                </div>
                
                <p className="text-muted-foreground text-xs font-medium opacity-80">
                    Deleting your account will permanently remove all your data from our systems.
                </p>

                <button 
                    onClick={handleDeleteClick}
                    disabled={deleteAccount.isPending}
                    className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
                </button>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction === "password" ? "Update Password" : "Delete Account"}
        description={
          confirmAction === "password" 
            ? "Are you sure you want to change your password? This will update your security signatures."
            : "This action is irreversible. All your data will be permanently removed. Are you sure?"
        }
        confirmText={confirmAction === "password" ? "Update Password" : "Delete Account"}
        variant={confirmAction === "password" ? "warning" : "danger"}
        isLoading={changePassword.isPending || deleteAccount.isPending}
      />
    </div>
  );
};
