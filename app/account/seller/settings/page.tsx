"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Store,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Camera,
  TrendingUp,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import api from "@/lib/api";
import imageCompression from 'browser-image-compression';
import { useQueryClient } from "@tanstack/react-query";

const SellerSettingsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useUser();
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<"shop" | "account" | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "branding" | "danger">("profile");
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    category: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [usernameStatus, setUsernameStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    error: string | null;
  }>({
    loading: false,
    available: null,
    error: null
  });

  useEffect(() => {
    const checkAuthAndShop = async () => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.push("/auth?mode=login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.accountType !== "seller") {
          router.push("/account");
          return;
        }
        setUser(parsedUser);

        const shopRes = await api.get("/shops/my-shop");
        const shopData = shopRes.data;

        if (shopData.success && shopData.data) {
          setShop(shopData.data);
          setFormData({
            name: shopData.data.name || "",
            username: shopData.data.username || "",
            description: shopData.data.description || "",
            address: shopData.data.address || "",
            phone: shopData.data.phone || "",
            email: shopData.data.email || "",
            category: shopData.data.category || ""
          });
          setAvatarPreview(shopData.data.avatar || "");
          setBannerPreview(shopData.data.banner || "");
        } else {
          router.push("/account/seller");
        }
      } catch (e) {
        console.error("Settings Auth Error:", e);
        // If it's a 401, axios interceptor handles it, but we can also handle it here
        router.push("/auth?mode=login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndShop();
  }, [router]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username === shop?.username) {
        setUsernameStatus({ loading: false, available: null, error: null });
        return;
      }

      if (formData.username.length < 3) {
        setUsernameStatus({ loading: false, available: null, error: "Username too short" });
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setUsernameStatus({ loading: false, available: null, error: "Only letters, numbers and underscores" });
        return;
      }

      setUsernameStatus(prev => ({ ...prev, loading: true }));
      try {
        const res = await api.get(`/shops/check-username/${formData.username}`);
        const data = res.data;
        setUsernameStatus({
          loading: false,
          available: data.available,
          error: data.available ? null : "Username already taken"
        });
      } catch (e) {
        setUsernameStatus({ loading: false, available: null, error: "Error checking availability" });
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, shop?.username]);

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await api.put("/shops/my-shop", formData);

      if (response.data.success) {
        setShop(response.data.data);
        toast.success("Shop settings updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["my-shop"] });
        if (response.data.data.username) {
          queryClient.invalidateQueries({ queryKey: ["shop", `@${response.data.data.username}`] });
        }
        queryClient.invalidateQueries({ queryKey: ["shop", response.data.data._id] });
      } else {
        toast.error(response.data.message || "Failed to update shop settings");
      }
    } catch (error: any) {
      console.error("Update Shop Error:", error);
      const message = error.response?.data?.message || error.message || "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: type === 'banner' ? 1920 : 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarPreview(reader.result as string);
          setAvatarFile(compressedFile);
        } else {
          setBannerPreview(reader.result as string);
          setBannerFile(compressedFile);
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('Failed to compress image. Please try a different file.');
      // Fallback to original file if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e, 'avatar');
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e, 'banner');

  const handleUpdateBranding = async () => {
    setIsUpdating(true);

    try {
      console.log("Starting branding update with files:", { 
        avatar: avatarFile?.name, 
        avatarSize: avatarFile?.size,
        banner: bannerFile?.name,
        bannerSize: bannerFile?.size
      });

      const submitData = new FormData();
      if (avatarFile) submitData.append("avatar", avatarFile);
      if (bannerFile) submitData.append("banner", bannerFile);

      if (!avatarFile && !bannerFile) {
        toast.info("Please select a new image to upload.");
        setIsUpdating(false);
        return;
      }

      const response = await api.put("/shops/my-shop/branding", submitData, {
        // Let Axios and the browser set the Content-Type with the boundary
        timeout: 120000 
      });

      console.log("Branding update response:", response.data);

      if (response.data.success) {
        setShop(response.data.data);
        setAvatarFile(null);
        setBannerFile(null);
        toast.success("Shop branding updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["my-shop"] });
        if (response.data.data.username) {
          queryClient.invalidateQueries({ queryKey: ["shop", `@${response.data.data.username}`] });
        }
        queryClient.invalidateQueries({ queryKey: ["shop", response.data.data._id] });
      } else {
        toast.error(response.data.message || "Failed to update branding");
      }
    } catch (error: any) {
      console.error("Update Branding Error:", error);
      const message = error.response?.data?.message || error.message || "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteShop = async () => {
    const confirmName = prompt(`To delete your shop, please type your shop name: "${shop.name}"`);
    if (confirmName !== shop.name) {
      if (confirmName !== null) toast.error("Shop name mismatch. Deletion cancelled.");
      return;
    }

    setIsDeleting("shop");

    try {
      const response = await api.delete("/shops/my-shop");

      if (response.data.success) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.accountType = "buyer";
        localStorage.setItem("user", JSON.stringify(userData));
        
        toast.success("Shop deleted successfully. Switched back to buyer account.");
        router.push("/account");
      } else {
        toast.error(response.data.message || "Failed to delete shop");
      }
    } catch (error: any) {
      console.error("Delete Shop Error:", error);
      const message = error.response?.data?.message || error.message || "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("PERMANENT ACTION: Are you sure you want to delete your entire account? This will delete your shop, all products, and your user profile forever. This cannot be undone.")) {
      return;
    }

    setIsDeleting("account");

    try {
      const response = await api.delete("/users/me");

      if (response.data.success) {
        toast.success("Account deleted permanently.");
        logout();
        router.push("/");
      } else {
        toast.error(response.data.message || "Failed to delete account");
      }
    } catch (error: any) {
      console.error("Delete Account Error:", error);
      const message = error.response?.data?.message || error.message || "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/account/seller" className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground border border-border">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Shop Settings</h2>
          <p className="text-muted-foreground font-medium">Manage your store identity and preferences.</p>
        </div>
      </div>

      <div className="flex p-1 bg-muted/50 border border-border rounded-2xl w-full max-w-md">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "profile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Profile
        </button>
        <button 
          onClick={() => setActiveTab("branding")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "branding" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Branding
        </button>
        <button 
          onClick={() => setActiveTab("danger")}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "danger" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:text-red-500"}`}
        >
          Danger Zone
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "profile" && (
          <form onSubmit={handleUpdateShop} className="bg-background rounded-2xl border border-border shadow-sm p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Shop Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  placeholder="Your Shop Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Shop Username (Handle)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                    className={`w-full pl-9 pr-5 py-3 bg-muted/50 border rounded-xl focus:ring-2 transition-all font-semibold ${
                      usernameStatus.error ? 'border-red-500' : usernameStatus.available ? 'border-green-500' : 'border-border'
                    }`}
                    placeholder="shop_handle"
                  />
                </div>
                {formData.username && (
                  <div className="flex items-center gap-2">
                    {usernameStatus.loading ? (
                      <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
                    ) : usernameStatus.error ? (
                      <p className="text-[10px] font-bold text-red-500">{usernameStatus.error}</p>
                    ) : usernameStatus.available ? (
                      <p className="text-[10px] font-bold text-green-500 uppercase">Available</p>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-semibold appearance-none"
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-semibold resize-none"
                  placeholder="Describe your store..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button 
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === "branding" && (
          <div className="bg-background rounded-2xl border border-border shadow-sm p-8 space-y-10">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Shop Banner</h3>
              <div className="relative group">
                <div className="h-48 w-full bg-muted/50 rounded-2xl overflow-hidden border border-border">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <TrendingUp className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Camera className="w-8 h-8" />
                    <span className="font-bold text-sm">Update Banner</span>
                    <input 
                      type="file" 
                      name="banner"
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleBannerChange} 
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Shop Avatar</h3>
              <div className="flex items-center gap-8">
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 bg-muted/50 rounded-2xl overflow-hidden border border-border shadow-sm">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Store className="w-10 h-10 opacity-20" />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                    <input 
                      type="file" 
                      name="avatar"
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-bold">Store Logo</p>
                  <p className="text-xs text-muted-foreground mt-1">Recommend 512x512px square image.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button 
                onClick={handleUpdateBranding}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Branding
              </button>
            </div>
          </div>
        )}

        {activeTab === "danger" && (
          <div className="space-y-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-red-600">Delete Shop</h3>
                <p className="text-sm text-red-600/70 mt-1">This will permanently remove your store and products. Sales data will be lost.</p>
              </div>
              <button 
                onClick={handleDeleteShop}
                disabled={isDeleting !== null}
                className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isDeleting === "shop" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Delete Shop"}
              </button>
            </div>

            <div className="bg-muted border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-1">Close your account forever. This action cannot be reversed.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting !== null}
                className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isDeleting === "account" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Delete Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerSettingsPage;
