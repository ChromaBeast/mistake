import React from "react";
import { TrendingDown, Zap, ShieldCheck, Scale } from "lucide-react";

export function LiveMetricsStats() {
  const stats = [
    {
      icon: TrendingDown,
      value: "₹14.8 Cr+",
      label: "Financial Leakage Identified",
      desc: "Recovered across tier-1 & tier-2 supply chains",
    },
    {
      icon: ShieldCheck,
      value: "99.8%",
      label: "Deterministic Precision",
      desc: "Zero hallucinated or arbitrary false alarms",
    },
    {
      icon: Zap,
      value: "< 50ms",
      label: "3-Way Cross-Match Engine",
      desc: "Instant matching across thousands of line items",
    },
    {
      icon: Scale,
      value: "0 Errors",
      label: "IEEE-754 Precision Loss",
      desc: "Pure 64-bit integer paise minor units (ADR-0002)",
    },
  ];

  return (
    <section id="metrics" className="py-16 border-y border-border/60 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-mono text-3xl font-extrabold text-foreground tracking-tight">
                  {stat.value}
                </div>
                <div className="font-semibold text-sm text-foreground">
                  {stat.label}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
