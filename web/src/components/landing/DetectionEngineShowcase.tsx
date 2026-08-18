import React from "react";

const LEAK_VECTORS = [
  {
    num: "01",
    title: "Contract Rate Deviations",
    category: "Price Arbitrage",
    impact: "35% - 45% of total leakage",
    description:
      "Suppliers bill line items above agreed master PO rates, slipping in unapproved commodity surcharges or updated spot prices. Mistake cross-references every line against contract caps.",
  },
  {
    num: "02",
    title: "Short Deliveries Billed in Full",
    category: "Volume Deficit",
    impact: "25% - 35% of total leakage",
    description:
      "Vendors invoice for the full purchase order volume while the factory weighbridge or dock GRN records partial receipt. We calculate the exact deficit before voucher creation.",
  },
  {
    num: "03",
    title: "Omitted SLA Delay Penalties",
    category: "Contract Compliance",
    impact: "15% - 20% of total leakage",
    description:
      "Supply agreements stipulate liquidated damages (e.g. 0.5% per week of delivery delay). We correlate transport challan dates with PO milestones to enforce penalty deductions.",
  },
  {
    num: "04",
    title: "Rejected & Defective Material Billing",
    category: "Quality Gate",
    impact: "10% - 15% of total leakage",
    description:
      "Material rejected during inbound quality inspection often bypasses receiving gate systems and gets paid by finance. We lock invoice line items until QC lot clearance is matched.",
  },
  {
    num: "05",
    title: "Orphan & Unbacked Invoices",
    category: "Reconciliation",
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
            Audit Scope / 5 Primary Leak Points
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Where enterprise procurement spend leaks.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            High invoice volume makes manual line-by-line verification impractical. Mistake continuously audits every transaction across five structural leak vectors.
          </p>
        </div>

        <div className="border-t border-b border-border divide-y divide-border">
          {LEAK_VECTORS.map((v) => (
            <div
              key={v.num}
              className="py-6 grid md:grid-cols-12 gap-4 items-baseline hover:bg-muted/10 transition-colors px-2"
            >
              <div className="md:col-span-1 font-mono text-xs font-bold text-muted-foreground">
                {v.num}
              </div>
              <div className="md:col-span-4 space-y-1">
                <h3 className="font-semibold text-base text-foreground">{v.title}</h3>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {v.category} • <span className="text-foreground">{v.impact}</span>
                </div>
              </div>
              <div className="md:col-span-7 text-xs text-muted-foreground leading-relaxed">
                {v.description}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
