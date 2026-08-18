import React from "react";
import { Factory, Truck, Flame, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function IndustrySolutionsSection() {
  const industries = [
    {
      icon: Factory,
      title: "Automotive & Engineering",
      subtitle: "Tier-1 & Tier-2 Component Makers",
      leakagePoints: [
        "Raw material price index fluctuation disputes",
        "Tooling and machining scrap deductions",
        "Part rejection during inbound quality checks",
      ],
    },
    {
      icon: Flame,
      title: "Steel, Metals & Fabrication",
      subtitle: "Mills, Foundries & Service Centers",
      leakagePoints: [
        "Weighbridge scale variance vs mill invoice MT",
        "Grade/heat surcharge rate discrepancies",
        "Coil slit width conversion rounding errors",
      ],
    },
    {
      icon: Truck,
      title: "Chemicals & Process Industries",
      subtitle: "Continuous Processing & Bulk Liquids",
      leakagePoints: [
        "Tanker temperature volume expansion losses",
        "Delayed tanker unloading demurrage charges",
        "Purity concentration differential adjustments",
      ],
    },
    {
      icon: ShoppingCart,
      title: "FMCG, Wholesale & Distribution",
      subtitle: "Multi-Hub Distribution Networks",
      leakagePoints: [
        "Contractual turnover & quarterly volume rebates",
        "Short-shipments across multi-city delivery drops",
        "Unauthorized logistics freight surcharges",
      ],
    },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="font-semibold text-xs uppercase tracking-wider">
          Tailored Solutions
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Engineered for Heavy Supply Chain Verticals
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Every industry has unique vendor contracting patterns and physical receiving nuances. Mistake is purpose-built for high-volume B2B operations.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border/70 bg-card flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{ind.title}</h3>
                  <p className="text-xs text-muted-foreground">{ind.subtitle}</p>
                </div>
                <div className="border-t border-border/40 pt-3 space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Common Leak Points:
                  </span>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    {ind.leakagePoints.map((pt, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
