"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Fingerprint,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldAlert,
  History
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

const SecurityPage = () => {
  const { user, updatePassword, isUpdatingPassword, deleteAccount, isDeletingAccount } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [deleteData, setDeleteData] = useState({
    password: "",
    reason: ""
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await deleteAccount(deleteData);
      // Hook handles logout and redirect on success
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Header */}
      <div className="relative group p-0.5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-red-500/30 to-primary/30 blur-3xl opacity-50 transition-opacity duration-1000" />
        <div className="relative overflow-hidden rounded-[3.5rem] border border-border shadow-sm dark:border-border/50 bg-background/40 backdrop-blur-3xl shadow-2xl p-8 md:p-14">
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex items-center gap-6 md:gap-12">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-700" />
                <div className="relative w-24 h-24 md:w-32 md:h-32 p-2 rounded-[3.2rem] bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-md shadow-2xl">
                  <div className="w-full h-full rounded-[2.8rem] bg-background border border-border dark:border-border/50 grid place-items-center">
                    <ShieldCheck className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Account Secured
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">Security Center</h1>
                <p className="text-muted-foreground text-base md:text-xl font-medium max-w-xl leading-relaxed">
                  Manage your credentials, login security, and account status to keep your assets safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Password Update Form */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Credentials</h2>
          </div>

          <div className="bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border shadow-sm p-8 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <form onSubmit={handlePasswordChange} className="space-y-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full bg-background/50 border border-border shadow-sm rounded-[2rem] px-8 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-background/50 border border-border shadow-sm rounded-[2rem] px-8 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Confirm New</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full bg-background/50 border border-border shadow-sm rounded-[2rem] px-8 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] animate-in zoom-in-95 duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-[2rem] animate-in zoom-in-95 duration-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-5 rounded-[2rem] bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isUpdatingPassword ? (
                  <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Update Credentials</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Global Protection & Danger Zone */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Ecosystem Status</h2>
          </div>

          <div className="grid gap-8">
            {/* Quick Protection Summary */}
            <div className="p-8 bg-background/40 backdrop-blur-3xl rounded-[3rem] border border-border shadow-sm shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/10">
                   <Fingerprint className="w-8 h-8" />
                </div>
                <div>
                   <h4 className="text-xl font-black text-foreground">Activity Monitoring</h4>
                   <p className="text-sm text-muted-foreground font-medium mt-1">We are currently monitoring your account for any suspicious login attempts.</p>
                </div>
              </div>
            </div >

            {/* Danger Zone Card */}
            <div className="p-10 bg-red-500/5 backdrop-blur-3xl rounded-[3rem] border border-red-500/20 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-[80px]" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                  <h4 className="text-2xl font-black text-red-500 tracking-tight">Danger Zone</h4>
                </div>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Permanently remove your account and all associated data. This action is <span className="text-red-500 font-bold underline">irreversible</span> and will wipe your storefront, inventory, and order history.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-5 rounded-[2rem] bg-background/60 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-500 font-black transition-all shadow-lg active:scale-95"
                >
                  Terminate Account Life
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-lg bg-background border border-red-500/20 rounded-[3.5rem] p-10 shadow-[0_40px_100px_rgba(239,68,68,0.2)] animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <ShieldAlert className="w-10 h-10 text-red-500" />
             </div>
             <h3 className="text-3xl font-black text-center text-foreground tracking-tighter mb-4">Account Termination</h3>
             <p className="text-center text-muted-foreground font-medium mb-10 leading-relaxed">
               Please confirm your identity to proceed with account deletion. This will wipe all your data from dotSoko.
             </p>

             <form onSubmit={handleDeleteAccount} className="space-y-6">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                  className="w-full bg-muted/30 border border-border/50 rounded-[2rem] px-8 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-bold"
                  required
                />
                <div className="flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setShowDeleteModal(false)}
                     className="flex-1 py-4 font-black text-muted-foreground hover:text-foreground transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     disabled={isDeletingAccount}
                     className="flex-[2] py-4 rounded-2xl bg-red-500 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20"
                   >
                     {isDeletingAccount ? "Terminating..." : "Confirm Deletion"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPage;
