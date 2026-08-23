"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, HelpCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface FindingFeedbackWidgetProps {
  mistakeId: string;
  onFeedbackSubmitted?: (type: "accurate" | "not_accurate" | "not_sure") => void;
}

export function FindingFeedbackWidget({ mistakeId, onFeedbackSubmitted }: FindingFeedbackWidgetProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFeedback = async (
    type: "accurate" | "not_accurate" | "not_sure",
    feedbackReason?: string
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/api/v1/mistakes/${mistakeId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_type: type, reason: feedbackReason || "" }),
      });
      if (!res.ok) {
        setError("Feedback could not be recorded right now. Please try again.");
        return;
      }
      setSelected(type);
      setSubmitted(true);
      onFeedbackSubmitted?.(type);
      setShowReasonModal(false);
    } catch {
      setError("Network issue — feedback was not recorded. Check connectivity and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        <span>Feedback recorded: {selected}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1.5 bg-muted/40 p-1 rounded-lg border border-border/60">
      <span className="text-[11px] font-medium text-muted-foreground px-1.5">Finding Accuracy:</span>
      <button
        onClick={() => handleFeedback("accurate")}
        disabled={isSubmitting}
        title="Accurate finding"
        className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-muted-foreground disabled:opacity-50"
      >
        <ThumbsUp className="h-3 w-3" />
        <span>Accurate</span>
      </button>
      <button
        onClick={() => setShowReasonModal(true)}
        disabled={isSubmitting}
        title="Not accurate (false positive)"
        className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-muted-foreground disabled:opacity-50"
      >
        <ThumbsDown className="h-3 w-3" />
        <span>Not Accurate</span>
      </button>
      <button
        onClick={() => handleFeedback("not_sure")}
        disabled={isSubmitting}
        title="Not sure / ambiguous"
        className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-muted-foreground disabled:opacity-50"
      >
        <HelpCircle className="h-3 w-3" />
        <span>Not Sure</span>
      </button>

      {error && (
        <p role="alert" className="text-[11px] text-rose-500 pl-1 max-w-[12rem]">
          {error}
        </p>
      )}

      <Modal
        isOpen={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setReason("");
        }}
        title="Why was this finding inaccurate?"
        description="Optional context helps fine-tune pilot detection models."
        maxWidth="sm"
      >
        <div className="space-y-3 pt-1">
          <textarea
            aria-label="Reason feedback is inaccurate"
            className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={3}
            placeholder="e.g. Valid trade discount applied, alternate agreement in place, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setShowReasonModal(false);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              isLoading={isSubmitting}
              onClick={() => handleFeedback("not_accurate", reason)}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
