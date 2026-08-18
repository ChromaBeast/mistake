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
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Spend Recovery Simulator
          </div>

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

          {/* Results Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            
            <div className="p-6 space-y-1 bg-muted/10">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Total Annual Recovery</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{estimatedRecoveryCr} Cr
              </div>
              <div className="text-[11px] text-muted-foreground">1.8% of direct spend</div>
            </div>

            <div className="p-6 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Rate Escalations</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-foreground">
                ₹{rateLeakageLakhs} L
              </div>
              <div className="text-[11px] text-muted-foreground">Contract deviations</div>
            </div>

            <div className="p-6 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Short Deliveries</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-foreground">
                ₹{shortShipmentLakhs} L
              </div>
              <div className="text-[11px] text-muted-foreground">Gate vs billed deficits</div>
            </div>

            <div className="p-6 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">SLA Penalties</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-foreground">
                ₹{penaltyLakhs} L
              </div>
              <div className="text-[11px] text-muted-foreground">Unclaimed delay charges</div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground font-mono text-[11px]">
              Average Payback Period: <strong className="text-foreground">&lt; 21 Business Days</strong>
            </span>
            <Link href="/signup">
              <Button size="sm" className="h-8 text-xs font-semibold gap-1">
                Verify With Sample Data <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
