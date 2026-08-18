"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ExecutiveSpendCalculator() {
  const [spendCr, setSpendCr] = useState<number>(150);

  // Benchmarked empirical recovery rates for Indian heavy industrial & distribution
  const estimatedRecoveryCr = (spendCr * 0.018).toFixed(2);
  const rateLeakageLakhs = Math.round(spendCr * 0.018 * 0.45 * 100);
  const shortShipmentLakhs = Math.round(spendCr * 0.018 * 0.35 * 100);
  const penaltyLakhs = Math.round(spendCr * 0.018 * 0.20 * 100);

  return (
    <section id="calculator" className="py-20 border-b border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
            ROI SIMULATOR FOR CFOS & FINANCE CONTROLLERS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Estimate Your Annual Capital Recovery
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on empirical audit data across Indian automotive, metals, chemical, and distribution enterprises, undetected supplier leakage averages 1.8% of total direct spend.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Slider Control Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl border border-border bg-card space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Annual Procurement Spend (₹ INR)
                </label>
                <span className="font-mono text-2xl font-black text-foreground">
                  ₹{spendCr} Crores
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={spendCr}
                onChange={(e) => setSpendCr(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Annual Procurement Spend Slider"
              />

              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>₹10 Cr (Mid-Market)</span>
                <span>₹500 Cr</span>
                <span>₹1,000 Cr+ (Large Enterprise)</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero upfront workflow disruption — connects to existing ERP pipelines</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Recovers capital directly via automated supplier debit notes</span>
              </div>
            </div>
          </div>

          {/* Recovery Breakdown Matrix */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                ESTIMATED ANNUAL CAPITAL RECOVERY
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-foreground">
                ₹{estimatedRecoveryCr} <span className="text-xl font-bold text-muted-foreground">Crores / Year</span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Rate Mismatches</div>
                  <div className="font-mono font-bold text-sm text-foreground">₹{rateLeakageLakhs} L</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">Short Receipts</div>
                  <div className="font-mono font-bold text-sm text-foreground">₹{shortShipmentLakhs} L</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">SLA Penalties</div>
                  <div className="font-mono font-bold text-sm text-foreground">₹{penaltyLakhs} L</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                Estimated Payback Period: <strong className="text-foreground font-mono">&lt; 21 Days</strong>
              </span>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto text-xs font-semibold gap-1.5">
                  Verify With Sample Data <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
