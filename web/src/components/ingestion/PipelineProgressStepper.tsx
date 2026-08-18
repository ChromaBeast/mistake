import React from "react";
import { PipelineState } from "@/types";
import { CheckCircle2, Clock, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PipelineProgressStepper({ status }: { status: PipelineState }) {
  const steps: { key: PipelineState; label: string }[] = [
    { key: "Queued", label: "Queued" },
    { key: "Processing", label: "Processing" },
    { key: "Extracting", label: "Extracting" },
    { key: "Analyzing", label: "Analyzing" },
    { key: "Completed", label: "Completed" },
  ];

  const stateOrder: Record<PipelineState, number> = {
    Queued: 0,
    Processing: 1,
    Extracting: 2,
    Analyzing: 3,
    Completed: 4,
    Failed: -1,
  };

  const currentIndex = stateOrder[status];
  const isFailed = status === "Failed";

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isDone = currentIndex > idx || status === "Completed";
          const isCurrent = currentIndex === idx && !isFailed;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isDone && "bg-emerald-500 text-white",
                    isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                    !isDone && !isCurrent && "bg-secondary text-muted-foreground border border-border",
                    isFailed && idx === 1 && "bg-rose-500 text-white"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFailed && idx === 1 ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isDone ? "text-emerald-500" : isCurrent ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-all",
                    currentIndex > idx ? "bg-emerald-500" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
