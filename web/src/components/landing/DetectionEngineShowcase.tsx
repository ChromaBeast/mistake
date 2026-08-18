import React from "react";

const LEAK_VECTORS = [
  {
    badge: "Rate Arbitrage",
    title: "Contract Rate Deviations",
    category: "Price Variance",
    impact: "35% - 45% of total leakage",
    description:
      "Suppliers bill line items above agreed master PO rates, slipping in unapproved commodity surcharges or updated spot prices. Mistake cross-references every line against contract caps.",
  },
  {
    badge: "Volume Deficit",
    title: "Short Deliveries Billed in Full",
    category: "Quantity Mismatch",
    impact: "25% - 35% of total leakage",
    description:
      "Vendors invoice for the full purchase order volume while the factory weighbridge or dock GRN records partial receipt. We calculate the exact deficit before voucher creation.",
  },
  {
    badge: "SLA Delay",
    title: "Omitted SLA Delay Penalties",
    category: "Contract Compliance",
    impact: "15% - 20% of total leakage",
    description:
      "Supply agreements stipulate liquidated damages (e.g. 0.5% per week of delivery delay). We correlate transport challan dates with PO milestones to enforce penalty deductions.",
  },
  {
    badge: "QC Reject",
    title: "Rejected & Defective Material Billing",
    category: "Quality Gate",
    impact: "10% - 15% of total leakage",
    description:
      "Material rejected during inbound quality inspection often bypasses receiving gate systems and gets paid by finance. We lock invoice line items until QC lot clearance is matched.",
  },
  {
    badge: "Unbacked Invoices",
    title: "Orphan & Unbacked Invoices",
    category: "Reconciliation Gap",
    impact: "5% - 10% of total leakage",
    description:
      "Invoices submitted without an authorized purchase order or verified warehouse gate entry pass are isolated before entering the accounts payable queue.",
  },
];

export function DetectionEngineShowcase() {
  return (
    <section id="features" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Leak Detection Vectors
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Where enterprise procurement spend leaks.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            High invoice volume makes manual line-by-line verification impractical. Mistake continuously audits every transaction across five structural leak vectors.
          </p>
        </div>

        <div className="border-t border-b border-border divide-y divide-border">
          {LEAK_VECTORS.map((v, i) => (
            <div
              key={i}
              className="py-6 grid md:grid-cols-12 gap-4 items-baseline hover:bg-muted/10 transition-colors px-2"
            >
              <div className="md:col-span-2">
                <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 border border-border/80 bg-muted/30 text-foreground/80 rounded-sm">
                  {v.badge}
                </span>
              </div>
              <div className="md:col-span-4 space-y-1">
                <h3 className="font-semibold text-base text-foreground">{v.title}</h3>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {v.category} • <span className="text-foreground">{v.impact}</span>
                </div>
              </div>
              <div className="md:col-span-6 text-xs text-muted-foreground leading-relaxed">
                {v.description}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
