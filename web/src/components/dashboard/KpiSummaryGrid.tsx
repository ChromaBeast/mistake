import React from "react";
import { KpiSummary } from "@/types";
import { formatPaiseToCompactINR, formatPaiseToINR } from "@/lib/formatters/inr";

export function KpiSummaryGrid({ kpi }: { kpi?: Partial<KpiSummary> }) {
  const totalLeakage = kpi?.total_leakage_minor ?? 0;
  const openContradictions = kpi?.open_contradictions_count ?? 0;
  const highRiskOrders = kpi?.high_risk_orders_count ?? 0;
  const missingEvidence = kpi?.missing_evidence_count ?? 0;
  const valueProtected = kpi?.value_protected_minor ?? 0;
  const resolutionRate =
    kpi?.resolution_rate_percent != null
      ? `${Math.round(kpi.resolution_rate_percent)}%`
      : "—";

  const metrics = [
    {
      title: "Leakage found",
      value: formatPaiseToCompactINR(totalLeakage),
      subtext: formatPaiseToINR(totalLeakage),
      highlight: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Open findings",
      value: openContradictions.toString(),
      subtext: `${highRiskOrders} high-risk orders`,
      highlight: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Missing documents",
      value: missingEvidence.toString(),
      subtext: "Orphan vendor invoices",
      highlight: "text-foreground",
    },
    {
      title: "Value protected",
      value: formatPaiseToCompactINR(valueProtected),
      subtext: formatPaiseToINR(valueProtected),
      highlight: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Resolved",
      value: resolutionRate,
      subtext: "Resolution rate",
      highlight: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      {metrics.map((m) => (
        <div key={m.title} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="text-[11px] font-medium text-muted-foreground tracking-wide">
            {m.title}
          </div>
          <div className={`text-2xl sm:text-[1.75rem] font-semibold font-mono tabular-nums tracking-tight ${m.highlight}`}>
            {m.value}
          </div>
          <div className="text-xs text-muted-foreground tabular-nums truncate">
            {m.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
