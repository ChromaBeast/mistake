"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { AuditLog } from "@/types";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { AuditDiffModal } from "@/components/audit/AuditDiffModal";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShieldCheck, History, AlertTriangle } from "lucide-react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const seq = ++requestSeqRef.current;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await api.getAuditLogs({
          action: actionFilter === "all" ? undefined : actionFilter,
          resource_type: resourceFilter === "all" ? undefined : resourceFilter,
        });
        if (seq !== requestSeqRef.current) return; // stale response
        let filtered = Array.isArray(res) ? res : [];
        if (actionFilter !== "all") {
          filtered = filtered.filter((l) => l.action === actionFilter);
        }
        if (resourceFilter !== "all") {
          filtered = filtered.filter((l) => l.resource_type === resourceFilter);
        }
        setLogs(filtered);
      } catch (err) {
        console.error(err);
        if (seq !== requestSeqRef.current) return;
        setLogs([]);
        setLoadError("Could not load the audit trail. Verify connectivity and retry.");
      } finally {
        if (seq === requestSeqRef.current) setIsLoading(false);
      }
    }
    load();
  }, [actionFilter, resourceFilter]);

  const handleViewDiff = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDiffModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <History className="h-5 w-5 text-primary" />
            <span>Immutable Tamper-Evident Audit Trail</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically verifiable record of all user actions, state transitions, and entity merges.
          </p>
        </div>

        <div className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Append-Only Ledger Active</span>
        </div>
      </div>

      <AuditFilterBar
        actionFilter={actionFilter}
        onActionChange={setActionFilter}
        resourceFilter={resourceFilter}
        onResourceChange={setResourceFilter}
      />

      {loadError && !isLoading && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-destructive flex-1">{loadError}</span>
          <button
            onClick={() => setResourceFilter((v) => v)}
            className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <AuditLogTable logs={logs} onViewDiff={handleViewDiff} />
      )}

      <AuditDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
