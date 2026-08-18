import React from "react";

const PIPELINE_STAGES = [
  {
    layer: "Data Ingestion Layer",
    name: "Multi-Source Ingestion",
    role: "Non-Invasive Data Capture",
    details:
      "Ingests Purchase Orders, Master Price Agreements, and Vendor Catalogs directly from SAP S/4HANA, TallyPrime, Oracle, or CSV. Inbound delivery challans and weighbridge tickets captured via dock scanner app.",
    stack: ["SAP S/4HANA", "TallyPrime", "Dock Mobile App", "OCR / CSV"],
  },
  {
    layer: "Reconciliation Layer",
    name: "Deterministic Match Engine",
    role: "Exact Paisa 3-Way Cross-Check",
    details:
      "Executes parallel mathematical cross-matching across thousands of line items in <50ms. Identifies rate mismatches, partial delivery deficits, and SLA delivery date breaches with exact integer paise math.",
    stack: ["Zero Float Drift", "Integer Paise", "Fuzzy GSTIN Match", "Audit Log"],
  },
  {
    layer: "Disbursement & Action Layer",
    name: "Pre-Disbursement Control",
    role: "Automated Capital Recovery",
    details:
      "Applies automated payment holds on disputed invoice line items before finance release. Generates mathematical dispute proof packages and automated vendor debit notes for accounts payable.",
    stack: ["Debit Note Gen", "Payment Hold", "GSTR-2B Sync", "ERP Webhooks"],
  },
];

export function EnterpriseArchitectureSection() {
  return (
    <section id="architecture" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            System Architecture
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Operates non-invasively with your ERP.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mistake connects parallel to your existing financial ledgers and factory receiving workflows. No risky ERP migrations or downtime required.
          </p>
        </div>

        <div className="border-t border-b border-border grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {PIPELINE_STAGES.map((s, i) => (
            <div key={i} className="p-6 md:p-8 space-y-4">
              <div className="space-y-1.5">
                <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 border border-border/80 bg-muted/30 text-foreground/80 rounded-sm">
                  {s.layer}
                </span>
                <h3 className="font-bold text-base text-foreground pt-1">{s.name}</h3>
                <div className="text-xs text-muted-foreground">{s.role}</div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.details}
              </p>

              <div className="pt-3 border-t border-border/60 flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">
                {s.stack.map((tech, j) => (
                  <span key={j} className="px-2 py-0.5 border border-border bg-muted/20">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
