import React from "react";
import { Check, X, ShieldAlert, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function PaiseProofSection() {
  return (
    <section id="math-proof" className="py-20 border-y border-border/60 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-semibold text-xs uppercase tracking-wider">
            Audit-Grade Precision
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Why Spreadsheets & Legacy ERPs Leak Money
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Complex Indian tax slabs (GST), fractional metric ton weights, and line-item freight splits cause cumulative rounding drift in standard accounting software.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Legacy System Pitfall Card */}
          <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <X className="w-5 h-5" /> Legacy ERPs & Manual Spreadsheets
              </div>
              <ul className="text-xs text-muted-foreground space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Cumulative Tax Rounding Drift:</strong> Decimals rounded at the item level vs invoice level create unexplainable statutory GST mismatches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Fractional Weight Inaccuracies:</strong> Metric tonnage conversions (e.g. 24.685 MT) lose value across multi-truck dispatches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Time-Consuming Vendor Disputes:</strong> Manual recalculations result in weeks of back-and-forth emails between finance teams.</span>
                </li>
              </ul>
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-2">
              <ShieldAlert className="w-4 h-4" /> Result: Unnecessary supplier friction & audit write-offs
            </div>
          </div>

          {/* Mistake Mathematical Guarantee */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <Check className="w-5 h-5" /> Mistake Audit Precision Engine
              </div>
              <ul className="text-xs text-muted-foreground space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Exact Paisa Integrity (₹0.01):</strong> Every single calculation is computed to the exact paisa without decimal rounding loss.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Instant Statutory Tax Proof:</strong> Pre-built GST & freight breakdowns that match GSTR-2B filing reports seamlessly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Automated Debit Note Ready:</strong> Generate mathematically undisputed variance sheets that vendors sign off on immediately.</span>
                </li>
              </ul>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-2">
              <Award className="w-4 h-4" /> Result: Instant dispute resolution & 100% audit-proof books
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
