import React from "react";
import { KpiSummary } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPaiseToCompactINR, formatPaiseToINR } from "@/lib/formatters/inr";
import {
  TrendingDown,
  AlertOctagon,
  FileQuestion,
  ShieldCheck,
  Percent,
} from "lucide-react";

export function KpiSummaryGrid({ kpi }: { kpi: KpiSummary }) {
  const cards = [
    {
      title: "Total Financial Leakage",
      value: formatPaiseToCompactINR(kpi.total_leakage_minor),
      subtext: `Full: ${formatPaiseToINR(kpi.total_leakage_minor)}`,
      icon: <TrendingDown className="h-5 w-5 text-rose-500" />,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      title: "Open Contradictions",
      value: kpi.open_contradictions_count.toString(),
      subtext: `${kpi.high_risk_orders_count} high risk orders`,
      icon: <AlertOctagon className="h-5 w-5 text-amber-500" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Missing Evidence (GRN/PO)",
      value: kpi.missing_evidence_count.toString(),
      subtext: "Orphan vendor invoices",
      icon: <FileQuestion className="h-5 w-5 text-indigo-500" />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Protected Value (Resolved)",
      value: formatPaiseToCompactINR(kpi.value_protected_minor),
      subtext: `Full: ${formatPaiseToINR(kpi.value_protected_minor)}`,
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Triage Resolution Rate",
      value: `${kpi.resolution_rate_percent}%`,
      subtext: "SLA compliance on findings",
      icon: <Percent className="h-5 w-5 text-sky-500" />,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, idx) => (
        <Card key={idx} className="relative overflow-hidden">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>{card.icon}</div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground font-mono">
                {card.value}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{card.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
