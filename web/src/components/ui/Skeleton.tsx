import React from "react";
import { cn } from "@/lib/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({
  className,
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/60 relative overflow-hidden",
        shimmer ? "shimmer-sweep" : "animate-pulse",
        className
      )}
      {...props}
    />
  );
}
