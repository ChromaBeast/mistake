import React from "react";
import { Skeleton } from "../Skeleton";

export function WorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading finding">
      {/* Back row */}
      <Skeleton className="h-8 w-44 rounded-md" />

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
          <Skeleton className="h-6 w-72 max-w-full" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <div className="space-y-2 lg:text-right border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
          <Skeleton className="h-3 w-28 ml-auto" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>

      {/* Triage Action Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md ml-auto" />
      </div>

      {/* 2-column Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((pane) => (
          <div key={pane} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="border border-border/60 rounded-lg bg-muted/20 p-4 space-y-2 min-h-[220px]">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-3 w-9/12" />
              <Skeleton className="h-3 w-10/12" />
              <Skeleton className="h-3 w-7/12" />
              <Skeleton className="h-3 w-8/12" />
            </div>
          </div>
        ))}
      </div>

      {/* Math Proof + Explanation row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <Skeleton className="h-5 w-52" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border/60">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-10/12" />
          <Skeleton className="h-3 w-9/12" />
        </div>
      </div>
    </div>
  );
}
