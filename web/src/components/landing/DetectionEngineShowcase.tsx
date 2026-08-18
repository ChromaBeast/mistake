import React from "react";
import { Layers, DollarSign, Clock, AlertOctagon, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function DetectionEngineShowcase() {
  const engines = [
    {
      icon: DollarSign,
      title: "Master Rate & Price Arbitrage",
      badge: "High Impact",
      desc: "Cross-checks line-item unit rates on vendor invoices against the master purchase order contract. Prevents silent margin erosion and unapproved rate hikes.",
    },
    {
      icon: Layers,
      title: "Quantity & Volume Variance",
      badge: "3-Way Match",
      desc: "Compares ordered quantity vs gate-inspected GRN volume vs final billed count. Automatically flags short shipments billed at full volume.",
    },
    {
      icon: Clock,
      title: "SLA & Delivery Penalty Breaches",
      badge: "Automated",
      desc: "Correlates bill of lading timestamps with contract SLA delivery windows. Computes exact contractual liquidated damages and delay penalties.",
    },
    {
      icon: AlertOctagon,
      title: "Status & Lifecycle Contradictions",
      badge: "Fraud Guard",
      desc: "Prevents double-billing for items that were rejected during floor quality inspection, cancelled, or returned to supplier.",
    },
    {
      icon: HelpCircle,
      title: "Orphan Evidence Detector",
      badge: "Reconciliation",
      desc: "Identifies phantom invoices lacking a backing PO, unlinked GRN goods receipts, or missing tax delivery challans.",
    },
  ];

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
          Detection Architecture
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          5 Deterministic Engines Working in Parallel
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Every ingested invoice, PO, and goods receipt note passes through all five specialized detection pipelines in under 50 milliseconds.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engines.map((engine, i) => {
          const Icon = engine.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all hover:shadow-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="info" className="text-[11px] font-mono">
                  {engine.badge}
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground">{engine.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{engine.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
