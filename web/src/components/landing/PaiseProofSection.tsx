import React from "react";

export function PaiseProofSection() {
  return (
    <section id="math-proof" className="py-20 border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-3xl space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Why spreadsheets and legacy ERPs lose money.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Multi-slab GST tax splits (CGST/SGST/IGST), fractional metric tonnage, and freight apportionment create cumulative rounding drift in standard accounting software.
          </p>
        </div>

        <div className="border border-border/60 rounded-2xl overflow-hidden grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50 bg-card shadow-xs">
          
          {/* Legacy ERP Column */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase font-semibold">Legacy Systems</div>
              <h3 className="font-bold text-base text-foreground">Standard Floating-Point Calculation</h3>
            </div>

            <ul className="text-xs text-muted-foreground space-y-3">
              <li className="space-y-0.5">
                <strong className="text-foreground">Cumulative Tax Rounding Drift:</strong>
                <p>Decimals rounded per line item vs at the invoice footer create statutory GST mismatches and write-offs.</p>
              </li>
              <li className="space-y-0.5">
                <strong className="text-foreground">Fractional Metric Tonnage Losses:</strong>
                <p>Weighbridge decimal MT conversions (e.g. 24.685 MT) lose value across high-frequency multi-truck movements.</p>
              </li>
              <li className="space-y-0.5">
                <strong className="text-foreground">Protracted Vendor Dispute Cycles:</strong>
                <p>Disputed rounding differences lead to weeks of spreadsheet email reconciliation between accounts teams.</p>
              </li>
            </ul>
          </div>

          {/* Mistake Engine Column */}
          <div className="p-6 md:p-8 space-y-4 bg-muted/10">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Mistake Engine</div>
              <h3 className="font-bold text-base text-foreground">Exact 64-Bit Integer Paise Math</h3>
            </div>

            <ul className="text-xs text-muted-foreground space-y-3">
              <li className="space-y-0.5">
                <strong className="text-foreground">Exact Paisa Integrity (₹0.01):</strong>
                <p>Every transaction, tax slab, and freight cost is computed strictly in integer paise minor units without rounding drift.</p>
              </li>
              <li className="space-y-0.5">
                <strong className="text-foreground">Instant Statutory GSTR-2B Proofs:</strong>
                <p>Generates pre-matched GST tax breakdown schedules that align with monthly tax filing portals.</p>
              </li>
              <li className="space-y-0.5">
                <strong className="text-foreground">Mathematically Undisputed Debit Notes:</strong>
                <p>Provides vendors with transparent line-by-line proof sheets that their finance teams sign off on immediately.</p>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
