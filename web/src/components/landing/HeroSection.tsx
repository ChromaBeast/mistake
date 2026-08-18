"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuditCase {
  id: string;
  vendor: string;
  gstin: string;
  item: string;
  hsn: string;
  poSpec: string;
  grnSpec: string;
  invSpec: string;
  variance: string;
  badge: string;
  status: string;
}

const AUDIT_CASES: AuditCase[] = [
  {
    id: "LEAK-8812",
    vendor: "BHARAT FORGINGS LTD",
    gstin: "27AABCB2212P1ZX",
    item: "Forged Alloy Flanges EN-8D (DN-150)",
    hsn: "7307.91.00",
    poSpec: "200 units @ ₹4,200.00",
    grnSpec: "200 Recv (QC Pass)",
    invSpec: "200 units @ ₹4,820.00",
    variance: "+₹1,24,000.00",
    badge: "Rate Discrepancy",
    status: "HOLD_PAYMENT",
  },
  {
    id: "LEAK-9041",
    vendor: "JINDAL HEAVY STRUCTURALS",
    gstin: "06AAACJ0124K1Z2",
    item: "Hot Rolled MS Channel ISMB 400 (12m)",
    hsn: "7216.32.00",
    poSpec: "50 MT @ ₹54,000.00/MT",
    grnSpec: "42 MT (Shortage: 8 MT)",
    invSpec: "50 MT @ ₹54,000.00/MT",
    variance: "+₹4,32,000.00",
    badge: "Short Delivery",
    status: "DEBIT_NOTE_READY",
  },
  {
    id: "LEAK-9304",
    vendor: "GUJARAT PROCESS FLUIDS CORP",
    gstin: "24AABCG9981M1ZY",
    item: "Industrial Hydraulic Fluid ISO VG 68",
    hsn: "2710.19.80",
    poSpec: "20 Barrels (Req: 10-Aug)",
    grnSpec: "Recv: 28-Aug (+18 Days)",
    invSpec: "Zero Penalty Applied",
    variance: "+₹86,400.00",
    badge: "SLA Delay Penalty",
    status: "PENALTY_DEDUCTED",
  },
];

export function HeroSection() {
  const [selectedCase, setSelectedCase] = useState<number>(0);
  const current = AUDIT_CASES[selectedCase];

  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border bg-muted/50 text-foreground font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Deterministic 3-Way Reconciliation • Exact Paise Math
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Autonomous Procurement Audit & Financial Leakage Detection.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Eliminate vendor overcharges, unapproved price escalations, and short-shipment billing across POs, Gate GRNs, and Invoices before payment disbursement.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/signup">
              <Button size="lg" className="h-11 px-6 text-sm font-semibold gap-2">
                Request Free Spend Audit <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-11 px-6 text-sm font-medium gap-2">
                Open Investigation Console <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Interactive 3-Way Audit Ledger Console */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-0">
          
          {/* Console Case Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-mono text-muted-foreground mr-2 uppercase">Live Cases:</span>
              {AUDIT_CASES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(i)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    selectedCase === i
                      ? "bg-foreground text-background font-bold"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  #{c.id}
                </button>
              ))}
            </div>
            <div className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              {current.variance} LEAKAGE
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-muted/20 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">ITEM & HSN</th>
                  <th className="px-4 py-2.5 font-medium">PURCHASE ORDER</th>
                  <th className="px-4 py-2.5 font-medium">GATE RECEIPT (GRN)</th>
                  <th className="px-4 py-2.5 font-medium">VENDOR INVOICE</th>
                  <th className="px-4 py-2.5 font-medium text-right">AUDIT VARIANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="bg-rose-500/[0.03]">
                  <td className="px-4 py-3 font-sans font-medium text-foreground">
                    {current.item}
                    <div className="text-[10px] text-muted-foreground font-mono">HSN: {current.hsn} • {current.vendor}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{current.poSpec}</td>
                  <td className="px-4 py-3 text-muted-foreground">{current.grnSpec}</td>
                  <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">{current.invSpec}</td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 font-bold">
                    {current.variance}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Console Action Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 text-xs">
            <div className="flex items-center gap-4 text-muted-foreground font-mono text-[11px]">
              <span>ACTION: <strong className="text-foreground">{current.status}</strong></span>
              <span>GSTIN: <strong className="text-foreground">{current.gstin}</strong></span>
            </div>
            <Link href="/login">
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">
                Generate Vendor Debit Note
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
