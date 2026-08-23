import React from "react";
import { PipelineState } from "@/types";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PipelineProgressStepper({
  status,
  failedStep,
}: {
  status: PipelineState;
  /** Index of the step where failure occurred; defaults to the current stage. */
  failedStep?: number;
}) {
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
  const failedIdx =
    isFailed
      ? failedStep !== undefined && failedStep >= 0 && failedStep < steps.length
        ? failedStep
        : Math.max(0, Math.min(steps.length - 1, currentIndex === -1 ? 1 : currentIndex))
      : -1;

  return (
    <div className="w-full py-2 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[280px]">
        {steps.map((step, idx) => {
          const isDone = !isFailed ? currentIndex > idx || status === "Completed" : idx < failedIdx;
          const isCurrent = !isFailed && currentIndex === idx;
          const isFailedStep = isFailed && idx === failedIdx;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all shrink-0",
                    isDone && "bg-emerald-500 text-white",
                    isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                    !isDone && !isCurrent && !isFailedStep && "bg-secondary text-muted-foreground border border-border",
                    isFailedStep && "bg-rose-500 text-white"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFailedStep ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "text-[9px] sm:text-[10px] font-medium whitespace-nowrap",
                    isDone
                      ? "text-emerald-500"
                      : isCurrent
                        ? "text-primary font-semibold"
                        : isFailedStep
                          ? "text-rose-500 font-semibold"
                          : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-all",
                    (isFailed ? idx < failedIdx : currentIndex > idx) ? "bg-emerald-500" : "bg-border"
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
