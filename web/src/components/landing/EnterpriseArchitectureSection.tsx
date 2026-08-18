import React from "react";
import { ArrowRight, Database, ShieldCheck, FileSpreadsheet, Server, Laptop, Cpu } from "lucide-react";

export function EnterpriseArchitectureSection() {
  return (
    <section id="architecture" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
            SYSTEM ARCHITECTURE & ERP INTEGRATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Non-Invasive Coexistence with Your Existing Tech Stack
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mistake sits parallel to your existing core financial ledgers and factory operations. No risky ERP migrations or downtime required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-muted-foreground">01. INGESTION</span>
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-base text-foreground">Multi-Source Ingestion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pulls Purchase Orders and Master Vendor Contracts directly from SAP, TallyPrime, Oracle, or raw CSV/Excel. Captures physical delivery challans via mobile dock app.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-muted">SAP S/4HANA</span>
              <span className="px-2 py-0.5 rounded bg-muted">TallyPrime</span>
              <span className="px-2 py-0.5 rounded bg-muted">Custom APIs</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-muted-foreground">02. AUDIT ENGINE</span>
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-base text-foreground">Deterministic 3-Way Match</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Executes exact integer paise arithmetic across thousands of line items in &lt;50ms. Identifies rate mismatches, partial volume gaps, and SLA breaches with mathematical proof.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-muted">Zero Float Drift</span>
              <span className="px-2 py-0.5 rounded bg-muted">5-Engine Matrix</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-muted-foreground">03. EXECUTION</span>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">Pre-Payment Hold & Recovery</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Triggers automated payment holds on disputed invoices. Generates audit-ready debit notes with backing proof sheets for instant vendor reconciliation.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-muted">Debit Notes</span>
              <span className="px-2 py-0.5 rounded bg-muted">GSTR-2B Ready</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
