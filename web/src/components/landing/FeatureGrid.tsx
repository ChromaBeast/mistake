import React from "react";
import { Smartphone, GitMerge, Lock, FileText, RefreshCw, ShieldCheck } from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: Smartphone,
      title: "Warehouse Gate Mobile App",
      desc: "Empower dock receiving operators with a dedicated Flutter app to scan bills of lading, verify physical quantities, and flag damaged goods before unloading.",
    },
    {
      icon: GitMerge,
      title: "Intelligent Vendor & GSTIN Grouping",
      desc: "Seamlessly links multi-state supplier branches, trade aliases, and parent corporate entities to master contract price agreements.",
    },
    {
      icon: Lock,
      title: "Maker-Checker Financial Controls",
      desc: "Enforce strict separation of duties between dock receiving, procurement contract managers, and accounts payable controllers.",
    },
    {
      icon: FileText,
      title: "Automated Dispute Proof Packages",
      desc: "Generates one-click debit notes with visual line-item comparisons and backing documents attached, enabling fast vendor sign-off.",
    },
    {
      icon: RefreshCw,
      title: "Works Alongside Your Existing ERP",
      desc: "Operates non-invasively alongside SAP, TallyPrime, Oracle, and Microsoft Dynamics without complex ERP migrations.",
    },
    {
      icon: ShieldCheck,
      title: "Statutory & Internal Audit Ready",
      desc: "Complete immutable audit history of every approved variance, waiver threshold, and recovery debit note for internal & external auditors.",
    },
  ];

  return (
    <section id="security" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Enterprise Financial Controls & Governance
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Comprehensive oversight from physical factory gate receiving all the way to bank disbursement authorization.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="space-y-3 p-6 rounded-2xl border border-border/60 bg-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
