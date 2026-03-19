"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useOrders } from "@/hooks/useOrders";

import { OverviewView } from "./OverviewView";
import { OrdersView } from "./OrdersView";
import { AddressesView } from "./AddressesView";
import { PaymentView } from "./PaymentView";
import { SecurityView } from "./SecurityView";
import { NotificationsView, SupportView } from "./OtherAccountViews";

const BuyerDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: orders = [], isLoading: isOrdersLoading } = useOrders();
  const [isMounted, setIsMounted] = useState(false);

  const view = searchParams.get("view") || "overview";

  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      router.push("/auth?mode=login");
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isOrdersLoading;

  if (isLoading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "overview":
        return <OverviewView user={user} orders={orders} />;
      case "orders":
        return <OrdersView />;
      case "addresses":
        return <AddressesView />;
      case "payment":
        return <PaymentView />;
      case "security":
        return <SecurityView />;
      case "notifications":
        return <NotificationsView />;
      case "support":
        return <SupportView />;
      default:
        return <OverviewView user={user} orders={orders} />;
    }
  };

  return (
    <div className="w-full">
      {renderView()}
    </div>
  );
};

export default BuyerDashboard;
