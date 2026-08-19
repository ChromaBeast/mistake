"use client";

import React from "react";
import { ReviewQueueItem } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters/date";
import { GitMerge, X, FileText, Check } from "lucide-react";

interface ReviewQueueListProps {
  items?: ReviewQueueItem[];
  onMerge: (item: ReviewQueueItem) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function ReviewQueueList({ items = [], onMerge, onReject }: ReviewQueueListProps) {
  const safeItems = items || [];
  if (safeItems.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-foreground">Review Queue is Clear</h4>
        <p className="text-xs text-muted-foreground mt-1">
          All extracted counterparties and vendor aliases have been resolved with high confidence.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {safeItems.map((item) => (
        <Card key={item.id} className="border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <Badge variant={item.entity_type === "Supplier" ? "info" : "success"} size="sm">
                  {item.entity_type}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  Similarity Score: {item.similarity_score}%
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="p-2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                  Incoming: &ldquo;{item.incoming_name}&rdquo;
                </div>
                <span className="text-muted-foreground">→ Suggest Match →</span>
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Target: &ldquo;{item.candidate_entity_name}&rdquo;
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[11px] text-muted-foreground font-mono pt-1">
                <span className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{item.source_document_name}</span>
                </span>
                <span>•</span>
                <span>Flagged {formatDate(item.suggested_at)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(item.id)}
                className="flex items-center space-x-1 text-rose-500 hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onMerge(item)}
                className="flex items-center space-x-1"
              >
                <GitMerge className="h-3.5 w-3.5" />
                <span>Confirm Merge</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
