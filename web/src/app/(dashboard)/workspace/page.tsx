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
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Investigation Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            3-WAY MATCH DISCREPANCY RECONCILIATION
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
        <div className="border border-border p-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : mistakes.length === 0 ? (
        <div className="border border-border p-12 text-center space-y-3 bg-card">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">Zero Active Discrepancies Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            All ingested Purchase Orders, Invoices, and Gate Receipts are currently fully reconciled.
          </p>
        </div>
      ) : (
        <div className="border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finding & Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Financial Impact</TableHead>
                <TableHead>Detected At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mistakes.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-xs text-foreground">
                    <div>
                      <p className="font-semibold text-foreground">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{m.entity_name}</p>
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
                  <TableCell className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    {formatPaiseToINR(m.financial_impact_minor)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDate(m.detected_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/workspace/${m.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-foreground hover:underline"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="h-3 w-3" />
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
