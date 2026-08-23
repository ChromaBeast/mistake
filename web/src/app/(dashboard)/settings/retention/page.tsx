"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RetentionPolicy } from "@/types";
import { RetentionPolicyManager } from "@/components/settings/RetentionPolicyManager";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

export default function RetentionSettingsPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();

  const loadPolicies = async () => {
    setLoadError(null);
    try {
      const list = await api.getRetentionPolicies();
      setPolicies(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Retention policies could not be loaded. Verify connectivity and retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleUpdate = async (id: string, days: number) => {
    const updated = await api.updateRetentionPolicy(id, days);
    setPolicies((prev) => prev.map((p) => (p.id === id ? updated : p)));
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
          <Shield className="h-5 w-5 text-primary" />
          <span>Data Retention & Automatic Purge Policies</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure how long historical invoices, raw files, and extracted evidence are retained.
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
            onClick={loadPolicies}
            className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : policies.length === 0 && !loadError ? (
        <div className="rounded-xl border border-border bg-card py-16 flex flex-col items-center justify-center space-y-2 text-center px-4">
          <Shield className="h-8 w-8 text-muted-foreground/40" />
          <p className="font-semibold text-sm text-foreground">No retention policies configured</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Policies will appear here once your workspace provisions its data resources.
          </p>
        </div>
      ) : (
        <RetentionPolicyManager policies={policies} onUpdatePolicy={handleUpdate} />
      )}
    </div>
  );
}
