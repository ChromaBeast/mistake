"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, HelpCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

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

  const handleFeedback = async (type: "accurate" | "not_accurate" | "not_sure", feedbackReason?: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/mistakes/${mistakeId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_type: type, reason: feedbackReason || "" }),
      });
      if (res.ok) {
        setSelected(type);
        setSubmitted(true);
        onFeedbackSubmitted?.(type);
      }
    } catch {
      // Graceful fallback for mock mode
      setSelected(type);
      setSubmitted(true);
      onFeedbackSubmitted?.(type);
    } finally {
      setIsSubmitting(false);
      setShowReasonModal(false);
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
        className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-muted-foreground"
      >
        <ThumbsUp className="h-3 w-3" />
        <span>Accurate</span>
      </button>
      <button
        onClick={() => setShowReasonModal(true)}
        disabled={isSubmitting}
        title="Not accurate (false positive)"
        className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-muted-foreground"
      >
        <ThumbsDown className="h-3 w-3" />
        <span>Not Accurate</span>
      </button>
      <button
        onClick={() => handleFeedback("not_sure")}
        disabled={isSubmitting}
        title="Not sure / ambiguous"
        className="flex items-center space-x-1 px-2 py-1 text-xs rounded hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-muted-foreground"
      >
        <HelpCircle className="h-3 w-3" />
        <span>Not Sure</span>
      </button>

      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full shadow-lg">
            <h4 className="text-sm font-semibold text-foreground mb-1.5">Why was this finding inaccurate?</h4>
            <p className="text-xs text-muted-foreground mb-3">Optional context helps fine-tune pilot detection models.</p>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-hidden focus:ring-1 focus:ring-primary"
              rows={3}
              placeholder="e.g. Valid trade discount applied, alternate agreement in place, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => setShowReasonModal(false)}>Cancel</Button>
              <Button size="sm" variant="danger" onClick={() => handleFeedback("not_accurate", reason)}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
