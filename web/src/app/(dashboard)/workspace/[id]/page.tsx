"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Mistake, MistakeStatus, BusinessEvent } from "@/types";
import { useAuth } from "@/lib/context/AuthContext";
import { EvidenceSplitView } from "@/components/workspace/EvidenceSplitView";
import { MultiSourceTimeline } from "@/components/workspace/MultiSourceTimeline";
import { MathBreakdownProof } from "@/components/workspace/MathBreakdownProof";
import { ExplanationCard } from "@/components/workspace/ExplanationCard";
import { TriageActionBar } from "@/components/workspace/TriageActionBar";
import { TransitionModal } from "@/components/workspace/TransitionModal";
import { TransitionHistoryLog } from "@/components/workspace/TransitionHistoryLog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WorkspaceSkeleton } from "@/components/ui/skeletons/WorkspaceSkeleton";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { ArrowLeft, Building2, AlertTriangle } from "lucide-react";

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [mistake, setMistake] = useState<Mistake | null>(null);
  const [timeline, setTimeline] = useState<BusinessEvent[]>([]);
  const [targetStatus, setTargetStatus] = useState<MistakeStatus | null>(null);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setError(null);
      setIsLoading(true);
      try {
        const data = await api.getMistake(id as string);
        if (cancelled) return;
        setMistake(data);
        try {
          const events = await api.getEntityTimeline(data.entity_id);
          if (!cancelled) setTimeline(events);
        } catch {
          if (!cancelled) setTimeline([]); // timeline is supplementary
        }
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load workspace data");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatusTransition = async (status: MistakeStatus, reason?: string) => {
    if (!mistake) throw new Error("Finding is not loaded yet");
    setIsTransitioning(true);
    try {
      const updated = await api.updateMistakeStatus(mistake.id, status, reason);
      setMistake({ ...updated });
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleAssign = async (userId: string) => {
    if (!mistake) return;
    const updated = await api.assignMistake(mistake.id, userId);
    setMistake({ ...updated });
  };

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (error || !mistake) {
    return (
      <div className="space-y-6">
        <Button size="sm" variant="ghost" onClick={() => router.push("/workspace")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Workspace
        </Button>
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error || "This finding could not be loaded."}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-xs underline underline-offset-2 hover:opacity-75 transition-opacity shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <Button size="sm" variant="ghost" onClick={() => router.push("/workspace")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Workspace
        </Button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              variant={mistake.severity === "critical" ? "danger" : mistake.severity === "high" ? "warning" : "info"}
              size="md"
              className="uppercase tracking-wider font-mono text-[10px]"
            >
              {mistake.severity}
            </Badge>
            <Badge variant="outline" size="md" className="capitalize font-mono text-[10px]">
              {(mistake.type || "").replace(/_/g, " ")}
            </Badge>
            <span className="text-xs font-mono uppercase text-muted-foreground px-2 py-0.5 rounded bg-secondary">
              Status: {mistake.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-lg font-bold text-foreground">{mistake.title}</h1>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{mistake.entity_name}</span>
          </div>
        </div>

        <div className="text-right border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6 shrink-0">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Financial Leakage
          </span>
          <span className="text-2xl font-bold font-mono text-rose-500">
            {formatPaiseToINR(mistake.financial_impact_minor)}
          </span>
        </div>
      </div>

      {/* Triage Action Bar */}
      <TriageActionBar
        mistake={mistake}
        userRole={user?.role}
        onOpenTransition={(st) => {
          setTargetStatus(st);
          setIsTransitionOpen(true);
        }}
        onAssign={handleAssign}
      />

      {/* Side-by-side Evidence Inspector */}
      <EvidenceSplitView evidence={mistake.evidence_items} />

      {/* 2-Column Section: Math Proof + Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MathBreakdownProof mathProof={mistake.math_proof} />
        <ExplanationCard
          explanation={mistake.explanation}
          remediationAdvice={mistake.remediation_advice}
        />
      </div>

      {/* Reconstructed Multi-Source Timeline */}
      <MultiSourceTimeline events={timeline} />

      {/* Status Transition History Log */}
      <TransitionHistoryLog transitions={mistake.transitions} />

      {/* Mandatory Reason Dialog */}
      <TransitionModal
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        targetStatus={targetStatus}
        onConfirm={handleStatusTransition}
        isSubmitting={isTransitioning}
      />
    </div>
  );
}
