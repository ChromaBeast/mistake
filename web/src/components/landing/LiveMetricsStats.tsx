import React from "react";
import { TrendingUp, Clock, ShieldCheck, FileCheck } from "lucide-react";

export function LiveMetricsStats() {
  const metrics = [
    {
      icon: TrendingUp,
      value: "1.8% to 3.2%",
      label: "Direct Margin Recovery",
      desc: "Average bottom-line EBITDA expansion recovered from undetected vendor overbilling.",
    },
    {
      icon: Clock,
      value: "85% Faster",
      label: "Invoice Audit Cycle",
      desc: "Replaces days of manual paperwork with automated sub-second 3-way reconciliation.",
    },
    {
      icon: ShieldCheck,
      value: "100% Pre-Payment",
      label: "Discrepancy Capture",
      desc: "Flag variances and generate debit notes before accounts payable releases funds.",
    },
    {
      icon: FileCheck,
      value: "Zero Disputes",
      label: "Vendor Resolution Clarity",
      desc: "Clear visual line-item proofs that suppliers and auditors agree upon immediately.",
    },
  ];

  return (
    <section id="metrics" className="py-16 border-y border-border/60 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-foreground tracking-tight">
                  {metric.value}
                </div>
                <div className="font-semibold text-sm text-foreground">
                  {metric.label}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {metric.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
