import React from "react";

const VERTICALS = [
  {
    badge: "Automotive & Tier-1",
    sector: "Automotive & Engineering",
    focus: "Forgings, Castings & Tier-1 Assemblies",
    risks: [
      "Raw material price index escalation formula disputes",
      "Machining and core scrap weight deductions",
      "Line-item rejects during inbound quality gate check",
    ],
  },
  {
    badge: "Metals & Mining",
    sector: "Steel, Metals & Fabrication",
    focus: "Foundries, Slitters & Structural Mills",
    risks: [
      "Weighbridge scale variance vs mill invoice MT",
      "Grade/heat chemical composition surcharge gaps",
      "Coil slit width conversion rounding errors",
    ],
  },
  {
    badge: "Process Industries",
    sector: "Chemicals & Process Plants",
    focus: "Bulk Liquids, Polymers & Packaging",
    risks: [
      "Tanker volume ambient temperature expansion loss",
      "Unloading delay demurrage charges",
      "Purity concentration differential adjustments",
    ],
  },
  {
    badge: "Wholesale & Logistics",
    sector: "FMCG & Distribution Hubs",
    focus: "Multi-Warehouse Distribution Networks",
    risks: [
      "Turnover and quarterly volume rebate realization",
      "Transit shortages across multi-city delivery drops",
      "Unapproved freight handling surcharges",
    ],
  },
];

export function IndustrySolutionsSection() {
  return (
    <section id="industries" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Target Industries
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Built for heavy industrial operations.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every vertical presents distinct contracting nuances and receiving realities. Mistake is configured for high-volume B2B supply chains.
          </p>
        </div>

        <div className="border-t border-b border-border grid sm:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 sm:divide-x divide-border">
          {VERTICALS.map((v, i) => (
            <div key={i} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 border border-border/80 bg-muted/30 text-foreground/80 rounded-sm">
                  {v.badge}
                </span>
                <h3 className="font-bold text-base text-foreground pt-1">{v.sector}</h3>
                <p className="text-xs text-muted-foreground">{v.focus}</p>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">Primary Leak Vectors:</div>
                <ul className="text-xs text-muted-foreground space-y-2">
                  {v.risks.map((r, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <span className="text-foreground font-mono font-bold shrink-0">—</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
