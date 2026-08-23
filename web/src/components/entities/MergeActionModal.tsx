"use client";

import React, { useEffect, useState } from "react";
import { ReviewQueueItem } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { GitMerge } from "lucide-react";

interface MergeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReviewQueueItem | null;
  onConfirm: () => Promise<void>;
  isSubmitting?: boolean;
}

export function MergeActionModal({
  isOpen,
  onClose,
  item,
  onConfirm,
  isSubmitting = false,
}: MergeActionModalProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  if (!item) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The merge could not be applied. Try again."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Entity Canonical Merge"
      description="This action will link the alias to the canonical entity and recalculate risk aggregations."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2 text-xs">
        <div className="rounded-lg bg-secondary/50 p-3 space-y-2 border border-border">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground shrink-0">Incoming Variant:</span>
            <span className="font-semibold text-foreground truncate">{item.incoming_name}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground shrink-0">Surviving Entity:</span>
            <span className="font-semibold text-primary truncate">{item.candidate_entity_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Match Confidence:</span>
            <span className="font-mono font-semibold text-emerald-500">{item.similarity_score}%</span>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-rose-500 px-1">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            className="flex items-center space-x-1.5"
          >
            <GitMerge className="h-3.5 w-3.5" />
            <span>Apply Merge</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
