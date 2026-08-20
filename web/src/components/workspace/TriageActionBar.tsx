"use client";

import React, { useState } from "react";
import { Mistake, MistakeStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Check, XCircle, CheckCircle2, UserCheck } from "lucide-react";
import { FindingFeedbackWidget } from "./FindingFeedbackWidget";
import { CompoundMismatchBadge } from "./CompoundMismatchBadge";

interface TriageActionBarProps {
  mistake: Mistake;
  userRole?: string;
  onOpenTransition: (targetStatus: MistakeStatus) => void;
  onAssign: (userId: string) => void;
}

export function TriageActionBar({
  mistake,
  userRole = "Owner",
  onOpenTransition,
  onAssign,
}: TriageActionBarProps) {
  const isViewer = userRole === "Viewer";

  const actionButton = (
    label: string,
    targetStatus: MistakeStatus,
    variant: "primary" | "secondary" | "outline" | "danger",
    icon: React.ReactNode
  ) => {
    const btn = (
      <Button
        size="sm"
        variant={variant}
        disabled={isViewer || mistake.status === targetStatus}
        onClick={() => onOpenTransition(targetStatus)}
        className="flex items-center space-x-1.5"
      >
        {icon}
        <span>{label}</span>
      </Button>
    );

    if (isViewer) {
      return (
        <Tooltip content="Viewers cannot modify finding status">
          <span>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
          Triage Actions:
        </span>
        {actionButton("Verify Finding", "verified", "primary", <Check className="h-3.5 w-3.5" />)}
        {actionButton("Resolve Leakage", "resolved", "outline", <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />)}
        {actionButton("Dismiss Discrepancy", "dismissed", "danger", <XCircle className="h-3.5 w-3.5" />)}
        <FindingFeedbackWidget mistakeId={mistake.id} />
        <CompoundMismatchBadge compoundGroupId={mistake.compound_group_id} isCompound={mistake.is_compound} />
      </div>

      <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
        <span className="text-xs text-muted-foreground">Assignee:</span>
        <span className="text-xs font-semibold text-foreground px-2.5 py-1 rounded-md bg-secondary border border-border">
          {mistake.assigned_to_name || "Unassigned"}
        </span>
      </div>
    </div>
  );
}
