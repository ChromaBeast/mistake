"use client";

import React, { useState } from "react";
import { RetentionPolicy } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface RetentionPolicyManagerProps {
  policies: RetentionPolicy[];
  onUpdatePolicy: (id: string, days: number) => Promise<void>;
  isLoading?: boolean;
}

export function RetentionPolicyManager({
  policies,
  onUpdatePolicy,
  isLoading,
}: RetentionPolicyManagerProps) {
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    policies.forEach((p) => {
      initial[p.id] = p.retention_days;
    });
    return initial;
  });

  const durationOptions = [
    { value: "30", label: "30 Days (Fast Purge)" },
    { value: "90", label: "90 Days (Quarterly)" },
    { value: "365", label: "1 Year (Standard B2B)" },
    { value: "2555", label: "7 Years (Statutory Indian Tax Compliance)" },
  ];

  const handleSave = async (id: string) => {
    const days = selectedDurations[id];
    if (days) {
      await onUpdatePolicy(id, days);
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
        <div className="space-y-3">
          {policies.map((p) => (
            <div
              key={p.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border border-border bg-card gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    {p.resource_type.replace("_", " ")}
                  </span>
                  <Badge variant={p.auto_purge_enabled ? "success" : "default"} size="sm">
                    {p.auto_purge_enabled ? "Auto Purge Active" : "Manual Retain"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Current policy: {p.retention_days} days retention period.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <div className="w-full sm:w-60">
                  <Select
                    options={durationOptions}
                    value={selectedDurations[p.id]?.toString() || p.retention_days.toString()}
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
                  onClick={() => handleSave(p.id)}
                  isLoading={isLoading}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
