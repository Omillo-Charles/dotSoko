"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ArrowLeftRight, Store, Package, Plus, ChevronDown, Bell, ShieldCheck, SlidersHorizontal, UserCog, Monitor, Trash2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import LogoutConfirmation from "@/components/LogoutConfirmation";
import { GoldCheck } from "@/components/GoldCheck";
import api from "@/lib/api";
import Link from "next/link";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { RegisterShopModal } from "@/components/RegisterShopModal";

type Tab = "account" | "seller";

const AccountPage = () => {
  const router = useRouter();
  const { user, isLoading: userLoading, logout, updateAccountType } = useUser();

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Tab>("account");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasShop, setHasShop] = useState<boolean | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [myShop, setMyShop] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const accountTabRef = useRef<HTMLButtonElement | null>(null);
  const sellerTabRef = useRef<HTMLButtonElement | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
    if (!userLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;
    checkShop();
  }, [user]);

  useEffect(() => {
    if (hasShop && active === "seller") {
      loadMyProducts();
    }
  }, [hasShop, active]);

  useEffect(() => {
    const calc = () => {
      const container = tabsRef.current;
      const target = active === "account" ? accountTabRef.current : sellerTabRef.current;
      if (!container || !target) return;
      const left = target.offsetLeft;
      const width = target.offsetWidth;
      setIndicator({ left, width });
    };
    const rafCalc = () => requestAnimationFrame(calc);
    calc();
    window.addEventListener("resize", rafCalc);
    return () => {
      window.removeEventListener("resize", rafCalc);
    };
  }, [active]);

  const checkShop = async () => {
    try {
      const res = await api.get("/shops/my-shop");
      setHasShop(Boolean(res.data?.data));
      setMyShop(res.data?.data || null);
    } catch {
      setHasShop(false);
      setMyShop(null);
    }
  };

  const loadMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get("/products/my-products");
      if (res.data?.success) {
        setProducts(res.data.data.slice(0, 6));
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    logout();
    router.push("/auth?mode=login");
  };

  const switchMode = async () => {
    const nextType = user?.accountType === "seller" ? "buyer" : "seller";
    try {
      await updateAccountType(nextType as any);
    } catch {}
  };

  const Header = (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 shadow-sm border border-border mb-6 md:mb-8 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
      <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[1.75rem] bg-gradient-to-br from-primary to-secondary p-0.5">
            <div className="w-full h-full rounded-[1.4rem] md:rounded-[1.6rem] bg-background grid place-items-center">
              <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] md:text-[10px] font-black rounded-full bg-background border border-border shadow-sm">
            Profile
          </span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              Hello, {mounted ? (user?.name || "User") : "User"}!
            </h1>
            {user?.isPremium && <GoldCheck className="w-6 h-6" />}
          </div>
          <p className="text-muted-foreground font-medium">{mounted ? user?.email : ""}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-700 border border-green-500/20">
              Verified Account
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Member since {mounted ? new Date().getFullYear() : ""}
            </span>
            <button
              onClick={switchMode}
              className="px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 transition-all bg-foreground text-background hover:opacity-90"
            >
              <ArrowLeftRight className="w-3 h-3" />
              Switch Mode
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors rounded-xl font-bold text-sm w-full md:w-auto justify-center"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const Tabs = (
    <div
      ref={tabsRef}
      role="tablist"
      aria-label="Account sections"
      className="relative flex w-full py-1 bg-muted rounded-2xl mb-6 md:mb-8 overflow-hidden"
    >
      <span
        className="absolute top-1 bottom-1 rounded-xl bg-background border border-border shadow-sm transition-all duration-300 pointer-events-none z-0"
        style={{ left: indicator.left, width: indicator.width }}
      />
      <button
        ref={accountTabRef}
        role="tab"
        aria-selected={active === "account"}
        onClick={() => setActive("account")}
        className={`relative z-10 flex-1 min-w-0 px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 justify-center whitespace-nowrap ${
          active === "account" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="w-4 h-4 shrink-0" />
        <span>Account Center</span>
      </button>
      <button
        ref={sellerTabRef}
        role="tab"
        aria-selected={active === "seller"}
        onClick={() => setActive("seller")}
        className={`relative z-10 flex-1 min-w-0 px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 justify-center whitespace-nowrap ${
          active === "seller" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Store className="w-4 h-4 shrink-0" />
        <span>Seller Center</span>
      </button>
    </div>
  );

  const AccountCenter = (
    <AccountCenterDropdowns />
  );

  const SellerCenter = (
    <div className="space-y-6">
      <div className="bg-background p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-bold text-foreground">{myShop?.name || "Shop"}</h3>
            <p className="text-sm text-muted-foreground">
              {hasShop === null ? "Checking shop status..." : hasShop ? "Manage your shop" : "Create your shop"}
            </p>
          </div>
        </div>
        {hasShop ? (
          <Link href={user?.isPremium ? "/premium/dashboard" : "/account/seller"} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold">
            Open Dashboard
          </Link>
        ) : (
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Create Shop
          </button>
        )}
      </div>

      {hasShop && (
        <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              Recent Products
            </h3>
            <Link href="/account/seller/products" className="text-primary font-bold text-sm">
              View All
            </Link>
          </div>
          {loadingProducts ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch">
              {products.map((p) => (
                <Link
                  key={p.id || p._id}
                  href={`/account/seller/products/edit/${p.id || p._id}`}
                  className="group bg-muted/30 rounded-[1.25rem] overflow-hidden border border-border hover:border-primary/30 transition-all w-full max-w-[11rem] sm:max-w-none mx-auto"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img src={p.image || "/placeholder-product.png"} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{p.name}</h4>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground font-medium text-sm">No products yet.</p>
              <Link href="/account/seller/products" className="inline-flex items-center gap-2 mt-4 text-primary font-bold text-sm hover:underline">
                <Plus className="w-4 h-4" />
                Add your first product
              </Link>
            </div>
          )}
        </div>
      )}
      <SellerCenterDropdowns hasShop={!!hasShop} />
    </div>
  );

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl md:max-w-[90vw] mx-auto px-4 md:px-8 pb-24 lg:pb-8">
      <LogoutConfirmation isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />
      {Header}
      {Tabs}
      {active === "account" ? AccountCenter : SellerCenter}
      <RegisterShopModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          checkShop();
          setActive("seller");
        }}
      />
    </div>
  );
};

export default AccountPage;

const SellerCenterDropdowns = ({ hasShop }: { hasShop: boolean }) => {
  const [open, setOpen] = useState<{ [k: string]: boolean }>({
    orders: true,
    plan: false,
    settings: false,
    danger: false,
  });
  const { orders, isLoading, updateStatus, isUpdating } = useSellerOrders();
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const handleDeleteShop = async () => {
    const ok = window.confirm("This will permanently delete your shop. Proceed?");
    if (!ok) return;
    try {
      await api.delete("/shops/my-shop");
      window.location.href = "/account";
    } catch {}
  };
  const Section = ({
    id,
    title,
    icon,
    children,
    subtitle,
  }: {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="relative bg-background border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center text-primary">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${open[id] ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {open[id] && <div className="p-5 border-t border-border bg-muted/20">{children}</div>}
    </div>
  );
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  return (
    <div className="space-y-4">
      <Section
        id="orders"
        title="Orders"
        subtitle="Manage incoming orders"
        icon={<Package className="w-5 h-5" />}
      >
        {!hasShop ? (
          <div className="text-sm text-muted-foreground">Create your shop to start receiving orders.</div>
        ) : isLoading ? (
          <div className="grid gap-3">
            <div className="h-20 bg-muted rounded-xl animate-pulse" />
            <div className="h-20 bg-muted rounded-xl animate-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-sm text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="grid gap-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="bg-background rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden border border-border grid place-items-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">#{o._id.slice(-6)}</div>
                    <div className="text-[11px] text-muted-foreground font-bold">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-black text-primary">KES {o.totalAmount.toLocaleString()}</div>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus({ orderId: o._id, status: e.target.value })}
                    disabled={isUpdating}
                    className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <Link href="/account/seller/orders" className="text-primary text-sm font-bold hover:underline">
              View all orders
            </Link>
          </div>
        )}
      </Section>
      <Section
        id="plan"
        title="Plan & Upgrade"
        subtitle="Manage your seller plan"
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        {!hasShop ? (
          <div className="text-sm text-muted-foreground">You don’t have a shop yet.</div>
        ) : (
          <div className="flex items-center justify-between bg-background rounded-xl border border-border p-4">
            <div>
              <div className="text-sm font-bold text-foreground">Seller Plan</div>
              <div className="text-[11px] text-muted-foreground font-bold">Upgrade for more features and reach</div>
            </div>
            <Link href="/premium" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold">
              Manage Plan
            </Link>
          </div>
        )}
      </Section>
      <Section
        id="settings"
        title="Shop Settings"
        subtitle="Profile, policies and preferences"
        icon={<UserCog className="w-5 h-5" />}
      >
        {!hasShop ? (
          <div className="text-sm text-muted-foreground">You don’t have a shop yet.</div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Edit your shop details and preferences.</div>
            <Link href="/account/seller/settings" className="px-4 py-2 rounded-xl bg-foreground text-background font-bold">
              Open Settings
            </Link>
          </div>
        )}
      </Section>
      <Section
        id="danger"
        title="Danger Zone"
        subtitle="Delete your shop"
        icon={<Trash2 className="w-5 h-5 text-red-600" />}
      >
        {!hasShop ? (
          <div className="text-sm text-muted-foreground">No shop to delete.</div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This will remove your shop and its listings.</p>
            <button
              onClick={handleDeleteShop}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors"
            >
              Delete Shop
            </button>
          </div>
        )}
      </Section>
    </div>
  );
};

const AccountCenterDropdowns = () => {
  const [open, setOpen] = useState<{ [k: string]: boolean }>({
    notifications: true,
    security: false,
    preferences: false,
    profile: false,
    sessions: false,
    danger: false,
  });
  const [notif, setNotif] = useState({
    marketing: false,
    orders: true,
    system: true,
  });
  const [prefs, setPrefs] = useState<{ language: string; currency: string; discoverable: boolean; personalizedAds: boolean }>({
    language: "en",
    currency: "KES",
    discoverable: true,
    personalizedAds: false,
  });
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notif-prefs");
      if (saved) {
        try {
          setNotif({ ...notif, ...JSON.parse(saved) });
        } catch {}
      }
      const savedPrefs = localStorage.getItem("account-prefs");
      if (savedPrefs) {
        try {
          setPrefs({ ...prefs, ...JSON.parse(savedPrefs) });
        } catch {}
      }
      const u = localStorage.getItem("user");
      if (u) {
        try {
          const parsed = JSON.parse(u);
          setProfile({ name: parsed.name || "", email: parsed.email || "" });
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNotif = (next: Partial<typeof notif>) => {
    const merged = { ...notif, ...next };
    setNotif(merged);
    if (typeof window !== "undefined") {
      localStorage.setItem("notif-prefs", JSON.stringify(merged));
    }
  };
  const savePrefs = (next: Partial<typeof prefs>) => {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    if (typeof window !== "undefined") {
      localStorage.setItem("account-prefs", JSON.stringify(merged));
    }
  };

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.current || !pwd.next || !pwd.confirm) return;
    if (pwd.next !== pwd.confirm) return;
    setChanging(true);
    try {
      await api.post("/auth/change-password", { currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err) {
    } finally {
      setChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("This will permanently delete your account. Proceed?");
    if (!ok) return;
    try {
      await api.delete("/users/me");
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth?mode=register";
      }
    } catch (e) {}
  };

  const Section = ({
    id,
    title,
    icon,
    children,
    subtitle,
  }: {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="relative bg-background border border-border rounded-2xl overflow-hidden group">
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center text-primary">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${open[id] ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {open[id] && <div className="p-5 border-t border-border bg-muted/20">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <Section id="notifications" title="Notifications" subtitle="Control how we keep you informed" icon={<Bell className="w-5 h-5" />}>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-background rounded-xl border border-border cursor-pointer hover:border-primary/30 transition-colors">
            <span className="text-sm font-bold text-foreground">Order updates</span>
            <input
              type="checkbox"
              checked={notif.orders}
              onChange={(e) => saveNotif({ orders: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-background rounded-xl border border-border cursor-pointer hover:border-primary/30 transition-colors">
            <span className="text-sm font-bold text-foreground">System alerts</span>
            <input
              type="checkbox"
              checked={notif.system}
              onChange={(e) => saveNotif({ system: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-background rounded-xl border border-border cursor-pointer hover:border-primary/30 transition-colors">
            <span className="text-sm font-bold text-foreground">Marketing & promos</span>
            <input
              type="checkbox"
              checked={notif.marketing}
              onChange={(e) => saveNotif({ marketing: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
          </label>
        </div>
      </Section>

      <Section id="security" title="Security" subtitle="Change your password" icon={<ShieldCheck className="w-5 h-5" />}>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md bg-background p-5 rounded-2xl border border-border">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Current Password</label>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">New Password</label>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Confirm New Password</label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={changing || !pwd.current || !pwd.next || pwd.next !== pwd.confirm}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {changing ? "Updating..." : "Update Password"}
          </button>
        </form>
      </Section>

      <Section id="preferences" title="Preferences" subtitle="Language, currency, and privacy" icon={<SlidersHorizontal className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl bg-background p-5 rounded-2xl border border-border">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Language</label>
            <select
              value={prefs.language}
              onChange={(e) => savePrefs({ language: e.target.value })}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Currency</label>
            <select
              value={prefs.currency}
              onChange={(e) => savePrefs({ currency: e.target.value })}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <label className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border cursor-pointer">
            <span className="text-sm font-bold text-foreground">Discoverable profile</span>
            <input
              type="checkbox"
              checked={prefs.discoverable}
              onChange={(e) => savePrefs({ discoverable: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border cursor-pointer">
            <span className="text-sm font-bold text-foreground">Personalized ads</span>
            <input
              type="checkbox"
              checked={prefs.personalizedAds}
              onChange={(e) => savePrefs({ personalizedAds: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
          </label>
        </div>
      </Section>

      <Section id="profile" title="Profile" subtitle="Basic information" icon={<UserCog className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl bg-background p-5 rounded-2xl border border-border">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="w-full mt-2 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Email"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                try {
                  const u = JSON.parse(localStorage.getItem("user") || "{}");
                  const merged = { ...u, name: profile.name, email: profile.email };
                  localStorage.setItem("user", JSON.stringify(merged));
                } catch {}
              }
            }}
            className="px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Save Locally
          </button>
        </div>
      </Section>

      <Section id="sessions" title="Sessions" subtitle="Manage your active sessions" icon={<Monitor className="w-5 h-5" />}>
        <div className="space-y-3 bg-background p-5 rounded-2xl border border-border">
          <div className="p-3 bg-muted/40 rounded-xl border border-border text-sm text-muted-foreground">
            Current device: {typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"}
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/auth?mode=login";
              }
            }}
            className="px-6 py-3 bg-muted rounded-xl font-bold hover:bg-muted/80"
          >
            Sign out of all sessions
          </button>
        </div>
      </Section>

      <Section id="danger" title="Danger Zone" subtitle="Delete your account" icon={<Trash2 className="w-5 h-5 text-red-600" />}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be undone. All your data will be removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </Section>
    </div>
  );
}
