"use client";

import React from "react";
import { ReviewQueueItem } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { GitMerge } from "lucide-react";

interface MergeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReviewQueueItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function MergeActionModal({
  isOpen,
  onClose,
  item,
  onConfirm,
  isLoading = false,
}: MergeActionModalProps) {
  if (!item) return null;

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
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Incoming Variant:</span>
            <span className="font-semibold text-foreground">{item.incoming_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Surviving Entity:</span>
            <span className="font-semibold text-primary">{item.candidate_entity_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Match Confidence:</span>
            <span className="font-mono font-semibold text-emerald-500">{item.similarity_score}%</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
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
