"use client";

import React, { useState } from "react";
import { EvidenceRef } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DocumentBoundingBox } from "./DocumentBoundingBox";
import { FileText, ZoomIn, CheckCircle2 } from "lucide-react";

export function EvidenceSplitView({ evidence }: { evidence: EvidenceRef[] }) {
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0);

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Side-by-Side Evidence Inspector
        </h4>
        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Extraction Confidence: {evidence[activeEvidenceIndex]?.confidence || 95}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Document Pane */}
        <Card className="overflow-hidden border-border/80">
          <CardHeader className="p-3 bg-muted/40 flex flex-row items-center justify-between border-b border-border">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <CardTitle className="text-xs font-semibold">{leftDoc.document_name}</CardTitle>
                <p className="text-[10px] text-muted-foreground">{leftDoc.document_type}</p>
              </div>
            </div>
            <Badge variant="info" size="sm">{leftDoc.field_name}</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Simulated Document Canvas with Bounding Highlight */}
            <div className="relative min-h-[14rem] h-auto rounded-lg bg-slate-900/10 dark:bg-slate-950/60 border border-border p-4 font-mono text-xs overflow-hidden flex flex-col justify-between gap-3">
              <div className="text-[11px] text-muted-foreground/80 space-y-1">
                <p className="font-semibold text-foreground/90">{leftDoc.document_type} • OFFICIAL RECORD</p>
                <p>Date: {new Date(leftDoc.observed_at).toLocaleDateString("en-IN")}</p>
              </div>

              {leftDoc.bounding_box && (
                <DocumentBoundingBox
                  box={leftDoc.bounding_box}
                  label={leftDoc.extracted_value}
                />
              )}

              <div className="rounded bg-card/90 p-2.5 border border-border shadow-xs mt-auto">
                <span className="text-[10px] text-muted-foreground uppercase block font-sans">
                  Extracted Line Snippet:
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5 break-words">
                  {leftDoc.raw_snippet || leftDoc.extracted_value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Document Pane */}
        {rightDoc ? (
          <Card className="overflow-hidden border-border/80">
            <CardHeader className="p-3 bg-muted/40 flex flex-row items-center justify-between border-b border-border">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-rose-500" />
                <div>
                  <CardTitle className="text-xs font-semibold">{rightDoc.document_name}</CardTitle>
                  <p className="text-[10px] text-muted-foreground">{rightDoc.document_type}</p>
                </div>
              </div>
              <Badge variant="danger" size="sm">{rightDoc.field_name}</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative min-h-[14rem] h-auto rounded-lg bg-slate-900/10 dark:bg-slate-950/60 border border-border p-4 font-mono text-xs overflow-hidden flex flex-col justify-between gap-3">
                <div className="text-[11px] text-muted-foreground/80 space-y-1">
                  <p className="font-semibold text-foreground/90">{rightDoc.document_type} • CONTRADICTION</p>
                  <p>Date: {new Date(rightDoc.observed_at).toLocaleDateString("en-IN")}</p>
                </div>

                {rightDoc.bounding_box && (
                  <DocumentBoundingBox
                    box={rightDoc.bounding_box}
                    label={rightDoc.extracted_value}
                  />
                )}

                <div className="rounded bg-card/90 p-2.5 border border-border shadow-xs mt-auto">
                  <span className="text-[10px] text-muted-foreground uppercase block font-sans">
                    Extracted Line Snippet:
                  </span>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5 break-words">
                    {rightDoc.raw_snippet || rightDoc.extracted_value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed">
            <p className="text-xs text-muted-foreground text-center">
              Single document finding or secondary document missing.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
