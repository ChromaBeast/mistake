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
    <section className="pt-16 pb-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Typographic Thesis Header */}
        <div className="max-w-3xl space-y-6">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Platform / Autonomous 3-Way Reconciliation
          </div>

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
        <div className="border border-border bg-card">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-border bg-muted/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground uppercase text-[11px]">Audit Case:</span>
              <div className="flex items-center gap-1">
                {AUDIT_RECORDS.map((rec, i) => (
                  <button
                    key={rec.id}
                    onClick={() => setActiveIdx(i)}
                    className={`px-2 py-1 font-mono text-[11px] border ${
                      activeIdx === i
                        ? "bg-foreground text-background border-foreground font-semibold"
                        : "bg-background text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    #{rec.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="font-mono tabular-nums text-xs font-bold text-rose-600 dark:text-rose-400">
              VARIANCE: {current.variance}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-border bg-muted/10 text-muted-foreground text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">MATERIAL DESCRIPTION</th>
                  <th className="px-4 py-2.5 font-medium">PO CONTRACT TERMS</th>
                  <th className="px-4 py-2.5 font-medium">GATE RECEIPT (GRN)</th>
                  <th className="px-4 py-2.5 font-medium">BILLED INVOICE</th>
                  <th className="px-4 py-2.5 font-medium text-right">AUDIT DELTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3.5 font-sans font-medium text-foreground">
                    {current.item}
                    <div className="text-[10px] text-muted-foreground font-mono tabular-nums mt-0.5">
                      HSN: {current.hsn} • {current.vendor} ({current.gstin})
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{current.poTerms}</td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{current.grnGate}</td>
                  <td className="px-4 py-3.5 text-rose-600 dark:text-rose-400 font-semibold tabular-nums">{current.invoiceBilled}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {current.variance}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Row */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between text-[11px] font-mono text-muted-foreground gap-2">
            <div>
              FINDING: <span className="text-foreground font-semibold">{current.finding}</span>
            </div>
            <div>
              ACTION: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{current.resolution}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
