"use client";

import React, { useState } from "react";
import { MistakeStatus } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStatus: MistakeStatus | null;
  onConfirm: (status: MistakeStatus, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export function TransitionModal({
  isOpen,
  onClose,
  targetStatus,
  onConfirm,
  isLoading = false,
}: TransitionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!targetStatus) return null;

  const requiresReason = targetStatus === "dismissed" || targetStatus === "resolved";

  const handleConfirm = async () => {
    if (requiresReason && !reason.trim()) {
      setError("A reason is required to dismiss or resolve this finding.");
      return;
    }
    setError(null);
    await onConfirm(targetStatus, reason.trim() || undefined);
    setReason("");
    onClose();
  };

  const statusTitles: Record<MistakeStatus, { title: string; desc: string }> = {
    detected: { title: "Mark as Detected", desc: "Reset finding status to detected." },
    under_review: { title: "Begin Review", desc: "Mark finding as actively under investigation." },
    verified: { title: "Verify Finding", desc: "Confirm the discrepancy is genuine and requires vendor recovery." },
    resolved: { title: "Resolve Financial Leakage", desc: "Mark this discrepancy as recovered or settled." },
    dismissed: { title: "Dismiss Discrepancy", desc: "Mark this finding as false positive or acceptable variance." },
  };

  const info = statusTitles[targetStatus];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={info.title}
      description={info.desc}
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {requiresReason && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Mandatory Resolution / Dismissal Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="E.g., Vendor issued debit note DN-991, or acceptable tolerance per contract clause 4.1"
              className="w-full rounded-md border border-input bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={targetStatus === "dismissed" ? "danger" : "primary"}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Confirm Status Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
