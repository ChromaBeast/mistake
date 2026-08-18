import React from "react";
import { Check } from "lucide-react";

interface ReconciliationPulseProps {
  status?: "pending" | "matched" | "disputed";
  label?: string;
  className?: string;
}

export function ReconciliationPulse({
  status = "matched",
  label,
  className = "",
}: ReconciliationPulseProps) {
  const isMatched = status === "matched";
  const isDisputed = status === "disputed";

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${className}`}>
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isMatched
              ? "bg-emerald-400"
              : isDisputed
              ? "bg-rose-400"
              : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isMatched
              ? "bg-emerald-500"
              : isDisputed
              ? "bg-rose-500"
              : "bg-amber-500"
          }`}
        />
      </span>
      {label && (
        <span
          className={
            isMatched
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : isDisputed
              ? "text-rose-600 dark:text-rose-400 font-medium"
              : "text-muted-foreground"
          }
        >
          {label}
        </span>
      )}
    </div>
  );
}
