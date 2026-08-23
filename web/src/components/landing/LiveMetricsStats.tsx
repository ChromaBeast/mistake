import React from "react";
import { TrendingUp, Clock, ShieldCheck, FileCheck } from "lucide-react";

const OUTCOMES = [
  {
    icon: TrendingUp,
    value: "₹38.4 L",
    label: "Recovered in 30 Days",
    desc: "Auto-components Tier-1 supplier audit — unapproved rate escalations caught before two payment runs.",
    tag: "Pilot outcome · FY24",
  },
  {
    icon: Clock,
    value: "< 48 hrs",
    label: "Sample Audit Turnaround",
    desc: "Historical PO + invoice batch ingested, reconciled line-by-line, and returned as an evidence-backed summary.",
    tag: "Standard engagement SLA",
  },
  {
    icon: ShieldCheck,
    value: "Pre-Payment",
    label: "100% Discrepancy Capture Point",
    desc: "Variances are flagged and debit notes drafted before accounts payable releases funds — not after quarter close.",
    tag: "Product guarantee",
  },
  {
    icon: FileCheck,
    value: "Paise-Exact",
    label: "Undisputed Vendor Sign-off",
    desc: "Line-item proof sheets computed in integer paise that vendor finance teams verify and accept without dispute cycles.",
    tag: "Deterministic math engine",
  },
];

export function LiveMetricsStats() {
  return (
    <section id="outcomes" className="py-16 border-b border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Outcomes from the first audits.
          </h2>
          <p className="text-xs font-mono text-muted-foreground">
            Anonymized figures from FY24 pilot engagements. Full audit references available under NDA.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OUTCOMES.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3 flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tracking-tight">
                  {metric.value}
                </div>
                <div className="font-semibold text-sm text-foreground">
                  {metric.label}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {metric.desc}
                </p>
                <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pt-1 border-t border-border/40">
                  {metric.tag}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
