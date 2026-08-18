"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NumberTicker } from "@/components/ui/loaders/NumberTicker";

const MIN_SPEND = 10;
const MAX_SPEND = 1000;
const PRESETS = [50, 150, 500, 1000];

export function ExecutiveSpendCalculator() {
  const [spendCr, setSpendCr] = useState<number>(150);

  const estimatedRecoveryCr = Number((spendCr * 0.018).toFixed(2));
  const rateLeakageLakhs = Math.round(spendCr * 0.018 * 0.45 * 100);
  const shortShipmentLakhs = Math.round(spendCr * 0.018 * 0.35 * 100);
  const penaltyLakhs = Math.round(spendCr * 0.018 * 0.20 * 100);

  const fillPct = Math.min(100, Math.max(0, ((spendCr - MIN_SPEND) / (MAX_SPEND - MIN_SPEND)) * 100));

  return (
    <section id="calculator" className="py-20 border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Estimate direct EBITDA expansion.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Industrial manufacturers and multi-hub distributors average 1.8% recoverable leakage across direct materials.
          </p>
        </div>

        <div className="border border-border/60 bg-card rounded-2xl overflow-hidden shadow-xs hover:border-foreground/20 transition-all duration-300">
          
          {/* Top Control Bar */}
          <div className="p-6 md:p-8 border-b border-border/50 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-foreground block">
                  Annual Direct Procurement Spend
                </span>
                <span className="text-xs text-muted-foreground">
                  Move slider or select benchmark volume
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono tabular-nums text-3xl sm:text-4xl font-bold text-foreground">
                  ₹{spendCr}
                </span>
                <span className="text-sm font-normal text-muted-foreground">Crores / yr</span>
              </div>
            </div>

            {/* Range Slider Container with Filled Gradient */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={MIN_SPEND}
                  max={MAX_SPEND}
                  step="10"
                  value={spendCr}
                  onChange={(e) => setSpendCr(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, currentColor ${fillPct}%, rgba(148, 163, 184, 0.2) ${fillPct}%)`,
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer text-foreground accent-foreground focus:outline-none"
                  aria-label="Annual Procurement Spend Slider"
                />
              </div>

              {/* Exact Mathematically Positioned Markers & Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground mr-1">Benchmarks:</span>
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSpendCr(preset)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        spendCr === preset
                          ? "bg-foreground text-background font-semibold"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                      }`}
                    >
                      ₹{preset} Cr
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground tabular-nums">
                  Range: ₹10 Cr – ₹1,000 Cr+
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Grid with NumberTickers */}
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
            
            <div className="p-6 md:p-8 space-y-1 bg-muted/20">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Total Annual Recovery</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                <NumberTicker value={estimatedRecoveryCr} decimals={2} prefix="₹" suffix=" Cr" durationMs={200} />
              </div>
              <div className="text-[11px] text-muted-foreground">Direct bottom-line margin</div>
            </div>

            <div className="p-6 md:p-8 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Rate Escalations</div>
              <div className="font-mono tabular-nums text-lg font-semibold text-foreground">
                <NumberTicker value={rateLeakageLakhs} prefix="₹" suffix=" L" durationMs={200} />
              </div>
              <div className="text-[11px] text-muted-foreground">45% of total leakage</div>
            </div>

            <div className="p-6 md:p-8 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Short Deliveries</div>
              <div className="font-mono tabular-nums text-lg font-semibold text-foreground">
                <NumberTicker value={shortShipmentLakhs} prefix="₹" suffix=" L" durationMs={200} />
              </div>
              <div className="text-[11px] text-muted-foreground">35% of total leakage</div>
            </div>

            <div className="p-6 md:p-8 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase">SLA Penalties</div>
              <div className="font-mono tabular-nums text-lg font-semibold text-foreground">
                <NumberTicker value={penaltyLakhs} prefix="₹" suffix=" L" durationMs={200} />
              </div>
              <div className="text-[11px] text-muted-foreground">20% of total leakage</div>
            </div>

          </div>

          {/* Action Row */}
          <div className="p-4 md:p-6 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
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
