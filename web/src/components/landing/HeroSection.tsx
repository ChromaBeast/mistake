"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuditRecord {
  id: string;
  vendor: string;
  gstin: string;
  item: string;
  hsn: string;
  poTerms: string;
  grnGate: string;
  invoiceBilled: string;
  variance: string;
  finding: string;
  resolution: string;
}

const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: "LEAK-8812",
    vendor: "Bharat Forgings Ltd",
    gstin: "27AABCB2212P1ZX",
    item: "Forged Alloy Flanges EN-8D (DN-150)",
    hsn: "7307.91.00",
    poTerms: "200 @ ₹4,200.00",
    grnGate: "200 Recv (QC Pass)",
    invoiceBilled: "200 @ ₹4,820.00",
    variance: "+₹1,24,000.00",
    finding: "Unapproved Unit Rate Escalation (+14.7%)",
    resolution: "Auto Debit Note Issued",
  },
  {
    id: "LEAK-9041",
    vendor: "Jindal Heavy Structurals",
    gstin: "06AAACJ0124K1Z2",
    item: "Hot Rolled MS Channel ISMB 400 (12m)",
    hsn: "7216.32.00",
    poTerms: "50 MT @ ₹54,000.00/MT",
    grnGate: "42 MT (Short: 8 MT)",
    invoiceBilled: "50 MT @ ₹54,000.00/MT",
    variance: "+₹4,32,000.00",
    finding: "Short Delivery Invoiced at Full Contract Volume",
    resolution: "Payment Hold Applied",
  },
  {
    id: "LEAK-9304",
    vendor: "Gujarat Process Fluids Corp",
    gstin: "24AABCG9981M1ZY",
    item: "Industrial Hydraulic Fluid ISO VG 68",
    hsn: "2710.19.80",
    poTerms: "20 Bbls (SLA: 10-Aug)",
    grnGate: "Recv: 28-Aug (+18 Days)",
    invoiceBilled: "Zero Penalty Applied",
    variance: "+₹86,400.00",
    finding: "Contractual Delay Penalty Omitted from Invoice",
    resolution: "Liquidated Damages Deducted",
  },
];

export function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = AUDIT_RECORDS[activeIdx];

  return (
    <section className="pt-16 pb-20 border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Typographic Thesis Header - Pure Minimalist Title & Para */}
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            Catch vendor overbilling before payment release.
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Mistake continuously audits Purchase Orders, Warehouse Gate GRNs, and Supplier Invoices. 
            We identify rate variances, short shipments, and missed delay penalties with exact paisa precision.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" className="h-10 px-5 text-xs font-semibold gap-1.5">
                Request Spend Audit <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-10 px-5 text-xs font-medium gap-1.5">
                Open Workspace <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Minimalist Terminal / Ledger Console */}
        <div className="border border-border/60 bg-card rounded-xl overflow-hidden shadow-xs">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground uppercase text-[11px]">Audit Case:</span>
              <div className="flex items-center gap-1">
                {AUDIT_RECORDS.map((rec, i) => (
                  <button
                    key={rec.id}
                    onClick={() => setActiveIdx(i)}
                    className={`px-2 py-1 font-mono text-[11px] rounded transition-colors ${
                      activeIdx === i
                        ? "bg-foreground text-background font-semibold"
                        : "bg-background/80 text-muted-foreground border border-border/50 hover:text-foreground"
                    }`}
                  >
                    #{rec.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
              Detected Leakage: {current.variance}
            </div>
          </div>

          {/* 3-Way Comparative Grid */}
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 p-4 md:p-6 gap-4 md:gap-0">
            {/* Step 1: PO Terms */}
            <div className="md:pr-6 space-y-2">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">1. Master Purchase Order</div>
              <div className="font-bold text-sm text-foreground">{current.vendor}</div>
              <div className="font-mono text-xs text-muted-foreground">GSTIN: {current.gstin}</div>
              <div className="pt-2 border-t border-border/40 text-xs font-mono text-foreground">{current.poTerms}</div>
            </div>

            {/* Step 2: Gate GRN / Physical Receipts */}
            <div className="md:px-6 space-y-2">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">2. Warehouse Gate Entry (GRN)</div>
              <div className="font-bold text-sm text-foreground">{current.item}</div>
              <div className="font-mono text-xs text-muted-foreground">HSN: {current.hsn}</div>
              <div className="pt-2 border-t border-border/40 text-xs font-mono text-foreground">{current.grnGate}</div>
            </div>

            {/* Step 3: Billed Invoice & Discrepancy */}
            <div className="md:pl-6 space-y-2">
              <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase">3. Supplier Invoice Discrepancy</div>
              <div className="font-mono text-xs font-bold text-foreground">{current.invoiceBilled}</div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">{current.finding}</div>
              <div className="pt-2 border-t border-border/40 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ {current.resolution}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
