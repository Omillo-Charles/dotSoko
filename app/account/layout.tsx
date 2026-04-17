"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useMyShop } from "@/hooks/useShop";
import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: userLoading, logout } = useUser();
  const { data: myShop, isLoading: shopLoading } = useMyShop();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Determine which tab is active based on pathname
  const isSellerPath = pathname.startsWith("/account/seller");
  const activeTab = isSellerPath ? "seller" : "account";

  useEffect(() => {
    setMounted(true);
    // Only redirect if we are DEFINITELY not loading and DEFINITELY not authenticated
    if (mounted && !userLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, userLoading, mounted, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth?mode=login");
  };

  const handleTabChange = (tab: "account" | "seller") => {
    if (tab === "account") {
      router.push("/account");
    } else {
      router.push("/account/seller");
    }
  };

  if (!mounted || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <ConfirmationModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout}
        title="Sign Out?"
        description="Are you sure you want to sign out of your account? You'll need to sign back in to access your dashboard."
        confirmText="Sign Out"
        variant="danger"
      />
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border sticky top-[80px] z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{activeTab === "account" ? "Account Overview" : "Seller Console"}</h1>
        <div className="w-10 h-10">
          <img src="/defaultAvatar.jpeg" alt="Profile" className="w-full h-full rounded-full object-cover" />
        </div>
      </div>

      <div className="w-full flex gap-6 p-4 pb-24 lg:p-10 xl:p-16 lg:pb-16">
        
        <AccountSidebar 
          user={user}
          activeTab={activeTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onTabChange={handleTabChange}
          onLogoutClick={() => setShowLogoutConfirm(true)}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:custom-scrollbar lg:pr-2 overscroll-contain pb-32 lg:pb-32">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
