import React from "react";
import { Cpu, Layers, FlaskConical, Truck } from "lucide-react";

const VERTICALS = [
  {
    icon: Cpu,
    sector: "Automotive & Engineering",
    focus: "Forgings, Castings & Tier-1 Assemblies",
    risks: [
      "Raw material price index escalation formula disputes",
      "Machining scrap and core weight deductions",
      "Line-item rejects during inbound quality gate checks",
    ],
  },
  {
    icon: Layers,
    sector: "Steel, Metals & Fabrication",
    focus: "Foundries, Slitters & Structural Mills",
    risks: [
      "Weighbridge scale variance vs mill invoice tonnage",
      "Grade and heat chemical surcharge gaps",
      "Coil slit width conversion rounding errors",
    ],
  },
  {
    icon: FlaskConical,
    sector: "Chemicals & Process Plants",
    focus: "Bulk Liquids, Polymers & Packaging",
    risks: [
      "Tanker volume ambient temperature expansion loss",
      "Unloading delay demurrage charges",
      "Purity concentration differential adjustments",
    ],
  },
  {
    icon: Truck,
    sector: "FMCG & Distribution Hubs",
    focus: "Multi-Warehouse Distribution Networks",
    risks: [
      "Turnover and quarterly volume rebate realization",
      "Transit shortages across multi-city delivery drops",
      "Unapproved freight handling and fuel surcharges",
    ],
  },
];

export function IndustrySolutionsSection() {
  return (
    <section id="industries" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Minimalist Section Header */}
        <div className="max-w-3xl space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Built for heavy industrial operations.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every vertical presents distinct contracting nuances and receiving realities. Mistake is configured for high-volume B2B supply chains.
          </p>
        </div>

        {/* Minimalist 4-Column Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VERTICALS.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-foreground/20 transition-colors flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-md border border-border bg-muted/30 flex items-center justify-center text-foreground">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground leading-snug">
                      {v.sector}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {v.focus}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                    {v.risks.map((r, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-foreground/60 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
