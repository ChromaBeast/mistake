"use client";

import React, { useState } from "react";
import { RetentionPolicy } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";

interface RetentionPolicyManagerProps {
  policies: RetentionPolicy[];
  onUpdatePolicy: (id: string, days: number) => Promise<void>;
}

const DURATION_VALUES = [30, 90, 365, 2555];

export function RetentionPolicyManager({
  policies,
  onUpdatePolicy,
}: RetentionPolicyManagerProps) {
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSelected = (p: RetentionPolicy) => selectedDurations[p.id] ?? p.retention_days;
  const isDirty = (p: RetentionPolicy) => getSelected(p) !== p.retention_days;

  const handleSave = async (id: string, days: number) => {
    setError(null);
    setPendingId(id);
    try {
      await onUpdatePolicy(id, days);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The retention policy could not be updated. Try again."
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Data Retention & Automatic Purge Policies</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p role="alert" className="text-xs text-rose-500 px-1">
            {error}
          </p>
        )}
        <div className="space-y-3">
          {policies.map((p) => {
            const selected = getSelected(p);
            return (
              <div
                key={p.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border border-border bg-card gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono truncate">
                      {p.resource_type.replace(/_/g, " ")}
                    </span>
                    <Badge variant={p.auto_purge_enabled ? "success" : "default"} size="sm">
                      {p.auto_purge_enabled ? "Auto Purge Active" : "Manual Retain"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Current policy: {p.retention_days} days retention period.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                  <div className="w-full sm:w-60">
                    <Select
                      aria-label={`Retention period for ${p.resource_type.replace(/_/g, " ")}`}
                      options={DURATION_VALUES.map((d) => ({
                        value: String(d),
                        label:
                          d === 30
                            ? "30 Days (Fast Purge)"
                            : d === 90
                              ? "90 Days (Quarterly)"
                              : d === 365
                                ? "1 Year (Standard B2B)"
                                : "7 Years (Statutory Indian Tax Compliance)",
                      }))}
                      value={String(selected)}
                      onChange={(e) =>
                        setSelectedDurations({
                          ...selectedDurations,
                          [p.id]: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!isDirty(p) || pendingId !== null}
                    isLoading={pendingId === p.id}
                    onClick={() => handleSave(p.id, selected)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
