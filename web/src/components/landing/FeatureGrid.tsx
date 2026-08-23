import React from "react";

const GOVERNANCE_FEATURES = [
  {
    title: "Warehouse Gate Mobile App",
    detail: "Flutter mobile app for dock operators to scan bills of lading, record physical counts, and log damaged lots before warehouse entry.",
  },
  {
    title: "Fuzzy Entity & GSTIN Normalization",
    detail: "Automatically groups multi-state branches, trade aliases, and parent corporate entities to signed master contract rates.",
  },
  {
    title: "Strict Separation of Duties",
    detail: "Enforces strict approval boundaries between gate receiving, procurement contract owners, and accounts payable controllers.",
  },
  {
    title: "Automated Dispute Proof Packages",
    detail: "Generates one-click debit notes with visual line-item comparisons and backing documents attached for fast vendor sign-off.",
  },
  {
    title: "Non-Invasive ERP Integration",
    detail: "Operates alongside SAP, TallyPrime, Oracle, and Microsoft Dynamics via background data sync without altering core ledgers.",
  },
  {
    title: "Immutable Statutory Audit Log",
    detail: "Complete tamper-proof audit trail of every identified variance, approved waiver, and debit note for internal & tax auditors.",
  },
];

export function FeatureGrid() {
  return (
    <section id="governance" className="py-20 border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-3xl space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From factory gate to ledger entry, every action leaves proof.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From factory dock receiving to CFO disbursement sign-off, Mistake enforces complete auditability at every step.
          </p>
        </div>

        <div className="border-y border-border/50 grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-border/50">
          {GOVERNANCE_FEATURES.map((f) => (
            <div key={f.title} className="p-6 md:p-8 space-y-2 sm:border-b sm:border-border/40">
              <h3 className="font-bold text-base text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.detail}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
