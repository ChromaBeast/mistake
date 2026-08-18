"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldAlert, FileText, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"variance" | "po" | "grn">("variance");

  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border bg-muted/50 text-foreground font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise Financial Audit • Exact Paise Matching
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Autonomous 3-Way Match & Procurement Leakage Detection.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Eliminate undetected vendor overcharges, partial shipment leakage, and unapproved price hikes across Purchase Orders, Gate GRNs, and Invoices before payment release.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" className="h-11 px-6 text-sm font-semibold gap-2">
                Request Spend Audit <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-11 px-6 text-sm font-medium gap-2">
                Open Investigation Console <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Live 3-Way Audit Ledger Console */}
        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Console Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-border bg-muted/30 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                AUDIT_ID: #LEAK-2026-8812 • SUPPLIER: BHARAT FORGINGS LTD (GSTIN: 27AABCB2212P1ZX)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                ₹1,24,000.00 EXCESS OVERBILLING
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">ITEM DESCRIPTION</th>
                  <th className="px-4 py-2.5 font-medium">PO #8812 RATE</th>
                  <th className="px-4 py-2.5 font-medium">GATE GRN #401</th>
                  <th className="px-4 py-2.5 font-medium">BILLED INV #9042</th>
                  <th className="px-4 py-2.5 font-medium text-right">AUDIT DELTA</th>
                  <th className="px-4 py-2.5 font-medium text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="bg-rose-500/[0.04]">
                  <td className="px-4 py-3 font-sans font-medium text-foreground">
                    Forged Alloy Flanges EN-8D (DN-150)
                    <div className="text-[10px] text-muted-foreground font-mono">HSN: 7307.91.00</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">200 @ ₹4,200.00</td>
                  <td className="px-4 py-3 text-muted-foreground">200 Recv (QC Pass)</td>
                  <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">200 @ ₹4,820.00</td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 font-bold">
                    +₹1,24,000.00
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      Rate Discrepancy
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-sans font-medium text-foreground">
                    Seamless Stainless Tubes SS316 (12m)
                    <div className="text-[10px] text-muted-foreground font-mono">HSN: 7306.40.00</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">50 @ ₹18,500.00</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">50 Recv</td>
                  <td className="px-4 py-3 text-foreground">50 @ ₹18,500.00</td>
                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    ₹0.00 (Match)
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Console Footer */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Status: <strong className="text-amber-600 dark:text-amber-400 font-mono">HOLD_PAYMENT</strong></span>
              <span>Matched Lines: <strong className="text-foreground font-mono">2 / 2</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Generate Debit Note
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
