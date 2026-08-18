import React from "react";
import { KpiSummary } from "@/types";
import { formatPaiseToCompactINR, formatPaiseToINR } from "@/lib/formatters/inr";

export function KpiSummaryGrid({ kpi }: { kpi: KpiSummary }) {
  const metrics = [
    {
      title: "Total Financial Leakage",
      value: formatPaiseToCompactINR(kpi.total_leakage_minor),
      subtext: formatPaiseToINR(kpi.total_leakage_minor),
      highlight: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Open Contradictions",
      value: kpi.open_contradictions_count.toString(),
      subtext: `${kpi.high_risk_orders_count} high-risk orders`,
      highlight: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Missing Evidence (GRN/PO)",
      value: kpi.missing_evidence_count.toString(),
      subtext: "Orphan vendor invoices",
      highlight: "text-foreground",
    },
    {
      title: "Protected Capital (Resolved)",
      value: formatPaiseToCompactINR(kpi.value_protected_minor),
      subtext: formatPaiseToINR(kpi.value_protected_minor),
      highlight: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Triage Resolution Rate",
      value: `${kpi.resolution_rate_percent}%`,
      subtext: "SLA compliance",
      highlight: "text-foreground",
    },
  ];

  return (
    <div className="border border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border bg-card">
      {metrics.map((m, idx) => (
        <div key={idx} className="p-4 space-y-1">
          <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            {m.title}
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${m.highlight}`}>
            {m.value}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono tabular-nums truncate">
            {m.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
