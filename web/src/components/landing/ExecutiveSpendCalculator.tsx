"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ExecutiveSpendCalculator() {
  const [spendCr, setSpendCr] = useState<number>(150);

  const estimatedRecoveryCr = (spendCr * 0.018).toFixed(2);
  const rateLeakageLakhs = Math.round(spendCr * 0.018 * 0.45 * 100);
  const shortShipmentLakhs = Math.round(spendCr * 0.018 * 0.35 * 100);
  const penaltyLakhs = Math.round(spendCr * 0.018 * 0.20 * 100);

  return (
    <section id="calculator" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Estimate direct EBITDA expansion.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Industrial manufacturers and multi-hub distributors average 1.8% recoverable leakage across direct materials.
          </p>
        </div>

        <div className="border border-border bg-card">
          
          {/* Top Control Bar */}
          <div className="p-6 md:p-8 border-b border-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                Annual Direct Procurement Spend
              </span>
              <span className="font-mono tabular-nums text-3xl font-bold text-foreground">
                ₹{spendCr} <span className="text-base font-normal text-muted-foreground">Crores</span>
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={spendCr}
              onChange={(e) => setSpendCr(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-foreground"
              aria-label="Annual Procurement Spend Slider"
            />

            <div className="flex justify-between font-mono tabular-nums text-[11px] text-muted-foreground">
              <span>₹10 Cr</span>
              <span>₹250 Cr</span>
              <span>₹500 Cr</span>
              <span>₹1,000 Cr+</span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            
            <div className="p-6 md:p-8 space-y-1 bg-muted/20">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Total Annual Recovery</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{estimatedRecoveryCr} Cr
              </div>
              <div className="text-[11px] text-muted-foreground">Direct bottom-line margin</div>
            </div>

            <div className="p-6 md:p-8 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Rate Escalations</div>
              <div className="font-mono tabular-nums text-lg font-semibold text-foreground">
                ₹{rateLeakageLakhs} L
              </div>
              <div className="text-[11px] text-muted-foreground">45% of total leakage</div>
            </div>

            <div className="p-6 md:p-8 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Short Deliveries</div>
              <div className="font-mono tabular-nums text-lg font-semibold text-foreground">
                ₹{shortShipmentLakhs} L
              </div>
              <div className="text-[11px] text-muted-foreground">35% of total leakage</div>
            </div>

            <div className="p-6 md:p-8 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">SLA Penalties</div>
              <div className="font-mono tabular-nums text-lg font-semibold text-foreground">
                ₹{penaltyLakhs} L
              </div>
              <div className="text-[11px] text-muted-foreground">20% of total leakage</div>
            </div>

          </div>

          {/* Action Row */}
          <div className="p-4 md:p-6 bg-muted/10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground text-center sm:text-left">
              Based on empirical data across 500k+ reconciled B2B transactions.
            </span>
            <Link href="/signup">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                Audit Your ERP Ledgers <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
