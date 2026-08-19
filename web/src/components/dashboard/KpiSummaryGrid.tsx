import React from "react";
import { KpiSummary } from "@/types";
import { formatPaiseToCompactINR, formatPaiseToINR } from "@/lib/formatters/inr";

export function KpiSummaryGrid({ kpi }: { kpi?: Partial<KpiSummary> }) {
  const totalLeakage = kpi?.total_leakage_minor ?? 0;
  const openContradictions = kpi?.open_contradictions_count ?? 0;
  const highRiskOrders = kpi?.high_risk_orders_count ?? 0;
  const missingEvidence = kpi?.missing_evidence_count ?? 0;
  const valueProtected = kpi?.value_protected_minor ?? 0;
  const resolutionRate = kpi?.resolution_rate_percent ?? 100;

  const metrics = [
    {
      title: "Total Financial Leakage",
      value: formatPaiseToCompactINR(totalLeakage),
      subtext: formatPaiseToINR(totalLeakage),
      highlight: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Open Contradictions",
      value: openContradictions.toString(),
      subtext: `${highRiskOrders} high-risk orders`,
      highlight: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Missing Evidence (GRN/PO)",
      value: missingEvidence.toString(),
      subtext: "Orphan vendor invoices",
      highlight: "text-foreground",
    },
    {
      title: "Protected Capital (Resolved)",
      value: formatPaiseToCompactINR(valueProtected),
      subtext: formatPaiseToINR(valueProtected),
      highlight: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Triage Resolution Rate",
      value: `${resolutionRate}%`,
      subtext: "SLA compliance",
      highlight: "text-foreground",
    },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
      {metrics.map((m, idx) => (
        <div key={idx} className="p-4 space-y-1 bg-card">
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
