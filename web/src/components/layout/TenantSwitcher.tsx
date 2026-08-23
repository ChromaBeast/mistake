"use client";

import React from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

/**
 * Displays the active workspace. Multi-tenant switching is restricted to
 * platform administrators; the active tenant is therefore shown read-only.
 */
export function TenantSwitcher() {
  const { tenant } = useAuth();

  return (
    <div className="flex items-center justify-between w-full rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1.5 text-xs select-none">
      <div className="flex items-center space-x-2 min-w-0">
        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate max-w-[130px]">
          {tenant?.name || "Enterprise Org"}
        </span>
      </div>
      <span className="flex items-center gap-1 shrink-0 pl-2 font-mono text-[9px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    </div>
  );
}
