"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Subscription, Invoice } from "@/types";
import { BillingOverview } from "@/components/settings/BillingOverview";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function BillingSettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const [sub, invs] = await Promise.all([
        api.getSubscription(),
        api.getInvoices(),
      ]);
      setSubscription(sub);
      setInvoices(invs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpgrade = async (planTier: string) => {
    setIsUpgrading(true);
    try {
      await api.checkoutSubscription(planTier);
      await load();
    } catch (err) {
      console.error("Plan upgrade failed:", err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button size="sm" variant="ghost" onClick={() => router.push("/settings")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span>Subscription Plans & Invoices</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage tier limits, view GST compliant tax invoices, and upgrade your capacity.
        </p>
      </div>

      {isLoading || !subscription ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <BillingOverview
          subscription={subscription}
          invoices={invoices}
          onUpgrade={handleUpgrade}
          isUpgrading={isUpgrading}
        />
      )}
    </div>
  );
}
