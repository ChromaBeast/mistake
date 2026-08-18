import React from "react";
import { TrendingDown, PackageCheck, Clock, ShieldX, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function DetectionEngineShowcase() {
  const categories = [
    {
      icon: TrendingDown,
      title: "Contract Rate Deviations",
      badge: "Price Protection",
      desc: "Supplier invoices frequently sneak in unapproved raw material surcharges or higher spot rates. We cross-verify every invoice line item against signed master contracts.",
    },
    {
      icon: PackageCheck,
      title: "Short Deliveries Billed in Full",
      badge: "Quantity Audit",
      desc: "Suppliers bill for 1,000 units, but the warehouse gate only received 850. Mistake flags the 150-unit deficit instantly and calculates the exact overcharge.",
    },
    {
      icon: Clock,
      title: "Missed SLA & Delivery Penalties",
      badge: "Contract Enforcement",
      desc: "Contracts stipulate 0.5% penalty per week of dispatch delay. We audit transit dates against agreed delivery windows to recover legitimate liquidated damages.",
    },
    {
      icon: ShieldX,
      title: "Billing for Rejected Materials",
      badge: "Quality Guard",
      desc: "Materials rejected during floor quality inspection often get processed through accounts payable by mistake. We freeze payment until quality clearances are matched.",
    },
    {
      icon: HelpCircle,
      title: "Orphan & Unbacked Invoices",
      badge: "Fraud Prevention",
      desc: "Invoices received without a backing Purchase Order or verified Goods Receipt Note (GRN) are isolated before they can be routed for executive sign-off.",
    },
  ];

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="font-semibold text-xs uppercase tracking-wider">
          Leakage Prevention
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Where Does Your Procurement Spend Silently Leak?
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          High transaction volumes make manual invoice checking practically impossible. Mistake monitors the five critical leak points across every single supplier transaction.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all hover:shadow-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="info" className="text-[11px] font-medium">
                  {cat.badge}
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground">{cat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
