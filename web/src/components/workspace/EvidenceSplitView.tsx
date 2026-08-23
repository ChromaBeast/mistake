"use client";

import React from "react";
import { EvidenceRef } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DocumentBoundingBox } from "./DocumentBoundingBox";
import { formatDate } from "@/lib/formatters/date";
import { FileText, CheckCircle2 } from "lucide-react";

function EvidencePane({
  doc,
  tone,
}: {
  doc: EvidenceRef;
  tone: "primary" | "danger";
}) {
  const isDanger = tone === "danger";
  return (
    <Card className="overflow-hidden border-border/80">
      <CardHeader className="p-3 bg-muted/40 flex flex-row items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className={`h-4 w-4 shrink-0 ${isDanger ? "text-rose-500" : "text-primary"}`} />
          <div className="min-w-0">
            <CardTitle className="text-xs font-semibold truncate">{doc.document_name}</CardTitle>
            <p className="text-[10px] text-muted-foreground">{doc.document_type}</p>
          </div>
        </div>
        <Badge variant={isDanger ? "danger" : "info"} size="sm" className="shrink-0 ml-2">
          {doc.field_name}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Simulated Document Canvas with Bounding Highlight */}
        <div className="relative min-h-[14rem] h-auto rounded-lg bg-slate-900/10 dark:bg-slate-950/60 border border-border p-4 font-mono text-xs overflow-hidden flex flex-col justify-between gap-3">
          <div className="text-[11px] text-muted-foreground/80 space-y-1">
            <p className="font-semibold text-foreground/90">
              {doc.document_type} • {isDanger ? "CONTRADICTION" : "OFFICIAL RECORD"}
            </p>
            <p>Date: {formatDate(doc.observed_at)}</p>
          </div>

          {doc.bounding_box && (
            <DocumentBoundingBox box={doc.bounding_box} label={doc.extracted_value} />
          )}

          <div className="rounded bg-card/90 p-2.5 border border-border shadow-sm mt-auto">
            <span className="text-[10px] text-muted-foreground uppercase block font-sans">
              Extracted Line Snippet:
            </span>
            <p
              className={`text-xs font-semibold mt-0.5 break-words ${
                isDanger ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              }`}
            >
              {doc.raw_snippet || doc.extracted_value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EvidenceSplitView({ evidence }: { evidence: EvidenceRef[] }) {
  if (!evidence || evidence.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <p className="text-xs text-muted-foreground">
          No raw document evidence attached. Discrepancy flagged from cross-system status or missing counterpart.
        </p>
      </Card>
    );
  }

  const leftDoc = evidence[0];
  const rightDoc = evidence.length > 1 ? evidence[1] : null;
  const confidence =
    leftDoc.confidence ?? rightDoc?.confidence ?? null;

  // Surface extra documents beyond the primary pair instead of silently dropping them
  const additionalCount = Math.max(0, evidence.length - 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Side-by-Side Evidence Inspector
        </h4>
        {confidence !== null && (
          <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Extraction Confidence: {Math.round(confidence * (confidence <= 1 ? 100 : 1))}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EvidencePane doc={leftDoc} tone="primary" />
        {rightDoc ? (
          <EvidencePane doc={rightDoc} tone="danger" />
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed">
            <p className="text-xs text-muted-foreground text-center">
              Single document finding or secondary document missing.
            </p>
          </Card>
        )}
      </div>

      {additionalCount > 0 && (
        <p className="text-[11px] font-mono text-muted-foreground">
          +{additionalCount} additional linked document{additionalCount > 1 ? "s" : ""} in the evidence chain.
        </p>
      )}
    </div>
  );
}
