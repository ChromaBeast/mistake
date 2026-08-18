"use client";

import React from "react";
import { AuditLog } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";

interface AuditDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export function AuditDiffModal({ isOpen, onClose, log }: AuditDiffModalProps) {
  if (!log) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Immutable Audit Proof & State Diff"
      description={`Action: ${log.action} on ${log.resource_type} (${log.resource_id})`}
      maxWidth="2xl"
    >
      <div className="space-y-4 pt-2 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Cryptographically Sealed State Mutation</span>
          </div>
          <span className="font-mono text-[10px]">Actor: {log.user_name}</span>
        </div>

        {log.diff && log.diff.length > 0 && (
          <div className="space-y-2">
            <span className="font-semibold text-foreground block">Field-Level Modifications:</span>
            <div className="rounded-lg border border-border overflow-hidden">
              {log.diff.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-card border-b last:border-0 border-border text-xs font-mono"
                >
                  <span className="font-semibold text-foreground">{d.field}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      {JSON.stringify(d.old_value)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {JSON.stringify(d.new_value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="font-semibold text-rose-500 text-[11px]">Prior State (Before)</span>
            <pre className="p-3 rounded-lg bg-secondary/60 border border-border text-[10px] font-mono overflow-auto max-h-48 text-muted-foreground">
              {log.before_state
                ? JSON.stringify(log.before_state, null, 2)
                : "/* No prior state recorded (Creation event) */"}
            </pre>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-emerald-500 text-[11px]">Mutated State (After)</span>
            <pre className="p-3 rounded-lg bg-secondary/60 border border-border text-[10px] font-mono overflow-auto max-h-48 text-foreground">
              {log.after_state
                ? JSON.stringify(log.after_state, null, 2)
                : "/* State intact */"}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
}
