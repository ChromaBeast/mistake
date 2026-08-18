"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RetentionPolicy } from "@/types";
import { RetentionPolicyManager } from "@/components/settings/RetentionPolicyManager";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Shield } from "lucide-react";

export default function RetentionSettingsPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadPolicies = async () => {
    try {
      const list = await api.getRetentionPolicies();
      setPolicies(list);
    } catch (err) {
      console.error(err);
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

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <RetentionPolicyManager
          policies={policies}
          onUpdatePolicy={handleUpdate}
        />
      )}
    </div>
  );
}
