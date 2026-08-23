"use client";

import React from "react";
import { Mistake, MistakeStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Check, XCircle, CheckCircle2, PlayCircle } from "lucide-react";
import { FindingFeedbackWidget } from "./FindingFeedbackWidget";
import { CompoundMismatchBadge } from "./CompoundMismatchBadge";

interface TriageActionBarProps {
  mistake: Mistake;
  userRole?: string;
  onOpenTransition: (targetStatus: MistakeStatus) => void;
  onAssign: (userId: string) => void;
}

// State machine: Detected → Under Review → Verified → Resolved / Dismissed
export const ALLOWED_TRANSITIONS: Record<MistakeStatus, MistakeStatus[]> = {
  detected: ["under_review", "dismissed"],
  under_review: ["verified", "dismissed"],
  verified: ["resolved", "dismissed"],
  resolved: [],
  dismissed: [],
};

const TRANSITION_META: Record<
  MistakeStatus,
  { label: string; variant: "primary" | "outline" | "danger"; icon: React.ReactNode }
> = {
  under_review: {
    label: "Begin Review",
    variant: "primary",
    icon: <PlayCircle className="h-3.5 w-3.5" />,
  },
  verified: {
    label: "Verify Finding",
    variant: "primary",
    icon: <Check className="h-3.5 w-3.5" />,
  },
  resolved: {
    label: "Resolve Leakage",
    variant: "outline",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
  dismissed: {
    label: "Dismiss Discrepancy",
    variant: "danger",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  detected: { label: "", variant: "outline", icon: null },
};

export function TriageActionBar({
  mistake,
  userRole = "Owner",
  onOpenTransition,
  onAssign,
}: TriageActionBarProps) {
  const isViewer = userRole === "Viewer";
  const isTerminal =
    mistake.status === "resolved" || mistake.status === "dismissed";
  const nextStatuses = ALLOWED_TRANSITIONS[mistake.status] ?? [];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
          Triage Actions:
        </span>
        {isTerminal ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 capitalize">
            This finding is {mistake.status} — no further actions available
          </span>
        ) : (
          nextStatuses.map((st) => {
            const meta = TRANSITION_META[st];
            return (
              <Button
                key={st}
                size="sm"
                variant={meta.variant}
                disabled={isViewer}
                onClick={() => onOpenTransition(st)}
                className="flex items-center space-x-1.5"
              >
                {meta.icon}
                <span>{meta.label}</span>
              </Button>
            );
          })
        )}
        <FindingFeedbackWidget mistakeId={mistake.id} />
        <CompoundMismatchBadge
          compoundGroupId={mistake.compound_group_id}
          isCompound={mistake.is_compound}
        />
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
