"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Subscription, Invoice } from "@/types";
import { BillingOverview } from "@/components/settings/BillingOverview";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, CreditCard, AlertTriangle } from "lucide-react";

export default function BillingSettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  const load = async () => {
    setLoadError(null);
    try {
      const [sub, invs] = await Promise.all([api.getSubscription(), api.getInvoices()]);
      setSubscription(sub);
      setInvoices(Array.isArray(invs) ? invs : []);
    } catch (err) {
      console.error(err);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Billing data could not be loaded. Verify connectivity and retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpgrade = async (planTier: string) => {
    setIsUpgrading(true);
    setUpgradingTier(planTier);
    setActionError(null);
    try {
      await api.checkoutSubscription(planTier);
      await load();
    } catch (err) {
      console.error("Plan upgrade failed:", err);
      setActionError(
        err instanceof Error ? err.message : "The plan change could not be processed. Try again."
      );
    } finally {
      setIsUpgrading(false);
      setUpgradingTier(null);
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

      {loadError && !isLoading && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive flex-1">{loadError}</span>
          <button
            onClick={load}
            className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-400 flex-1">{actionError}</span>
        </div>
      )}

      {isLoading || (!subscription && !loadError) ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : subscription ? (
        <BillingOverview
          subscription={subscription}
          invoices={invoices}
          onUpgrade={handleUpgrade}
          isUpgrading={isUpgrading}
          upgradingTier={upgradingTier}
        />
      ) : null}
    </div>
  );
}
