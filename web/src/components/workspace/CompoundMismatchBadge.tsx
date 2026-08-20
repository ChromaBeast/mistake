"use client";

import React from "react";
import { Layers, AlertCircle } from "lucide-react";

interface CompoundMismatchBadgeProps {
  compoundGroupId?: string;
  isCompound?: boolean;
}

export function CompoundMismatchBadge({ compoundGroupId, isCompound }: CompoundMismatchBadgeProps) {
  if (!isCompound && !compoundGroupId) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium">
      <Layers className="h-3.5 w-3.5" />
      <span>Compound Discrepancy (Group #{compoundGroupId?.replace("cmp-", "").slice(0, 8) || "Linked"})</span>
    </div>
  );
}
