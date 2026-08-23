"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ReviewQueueItem } from "@/types";
import { ReviewQueueList } from "@/components/entities/ReviewQueueList";
import { MergeActionModal } from "@/components/entities/MergeActionModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { GitMerge, ArrowLeft, AlertTriangle, Inbox } from "lucide-react";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestSeqRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const seq = ++requestSeqRef.current;
    (async () => {
      try {
        const q = await api.getReviewQueue();
        if (!cancelled) setItems(Array.isArray(q) ? q : []);
        if (!cancelled) setLoadError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setItems([]);
          setLoadError(
            err instanceof Error
              ? err.message
              : "Could not load the review queue. Verify connectivity and retry."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenMerge = async (item: ReviewQueueItem) => {
    setSelectedItem(item);
    setIsMergeModalOpen(true);
  };

  const handleConfirmMerge = async () => {
    if (!selectedItem) throw new Error("No review item selected");
    setIsSubmitting(true);
    try {
      await api.mergeEntity({
        surviving_entity_id: selectedItem.candidate_entity_id,
        merged_entity_id: selectedItem.incoming_entity_id || selectedItem.id,
      });
      setIsMergeModalOpen(false);
      setSelectedItem(null);
      setIsLoading(true);
      try {
        const q = await api.getReviewQueue();
        setItems(Array.isArray(q) ? q : []);
      } finally {
        setIsLoading(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    await api.rejectMerge(id);
    setIsLoading(true);
    try {
      const q = await api.getReviewQueue();
      setItems(Array.isArray(q) ? q : []);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button size="sm" variant="ghost" onClick={() => router.push("/entities")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Directory
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
          <GitMerge className="h-5 w-5 text-primary" />
          <span>Human Review Queue</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review ambiguous supplier and customer name variations (70%–95% similarity score).
        </p>
      </div>

      {loadError && !isLoading && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive flex-1">{loadError}</span>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !loadError && items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 flex flex-col items-center justify-center space-y-2 text-center px-4">
          <Inbox className="h-8 w-8 text-muted-foreground/40" />
          <p className="font-semibold text-sm text-foreground">Review Queue is Clear</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            No ambiguous entity matches are awaiting human confirmation. New candidates appear here automatically during ingestion.
          </p>
        </div>
      ) : (
        <ReviewQueueList
          items={items}
          onMerge={handleOpenMerge}
          onReject={handleReject}
          isBusy={isLoading}
        />
      )}

      <MergeActionModal
        isOpen={isMergeModalOpen}
        onClose={() => {
          setIsMergeModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onConfirm={handleConfirmMerge}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
