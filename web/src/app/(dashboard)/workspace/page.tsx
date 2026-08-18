"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Mistake } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { formatDate } from "@/lib/formatters/date";
import { FileSearch, ArrowRight, AlertTriangle } from "lucide-react";

export default function WorkspaceListPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await api.getMistakes({
          status: activeTab,
          severity: severityFilter,
        });
        setMistakes(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeTab, severityFilter]);

  const tabs = [
    { id: "all", label: "All Findings" },
    { id: "detected", label: "Detected" },
    { id: "under_review", label: "Under Review" },
    { id: "verified", label: "Verified" },
    { id: "resolved", label: "Resolved" },
    { id: "dismissed", label: "Dismissed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <FileSearch className="h-5 w-5 text-primary" />
            <span>Investigation Workspace</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit, triage, and reconcile flagged discrepancies with deterministic proof.
          </p>
        </div>

        <div className="w-44">
          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: "all", label: "All Severities" },
              { value: "critical", label: "Critical Only" },
              { value: "high", label: "High Only" },
              { value: "medium", label: "Medium Only" },
            ]}
          />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finding Title & Entity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Financial Impact</TableHead>
                <TableHead>Detected At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mistakes.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">{m.entity_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono capitalize">
                      {m.type.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.severity === "critical"
                          ? "danger"
                          : m.severity === "high"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {m.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono uppercase text-muted-foreground">
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-rose-500">
                    {formatPaiseToINR(m.financial_impact_minor)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDate(m.detected_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/workspace/${m.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
