import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  colorVariant?: "primary" | "emerald" | "amber" | "rose";
}

export function Progress({
  value,
  colorVariant = "primary",
  className,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colors = {
    primary: "bg-primary",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300 ease-in-out", colors[colorVariant])}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
