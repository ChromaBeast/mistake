import React from "react";
import { Check, X, ShieldAlert, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function PaiseProofSection() {
  return (
    <section id="math-proof" className="py-20 border-y border-border/60 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
            ADR-0002 Financial Engine
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Exact Integer Paise Arithmetic. No Floating Point Drift.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Standard ERP systems use IEEE-754 binary floating-point numbers (`float64`), causing silent rounding errors on large volume calculations. Mistake enforces 64-bit integer paise throughout the entire stack.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Legacy Floating Point Card */}
          <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <X className="w-5 h-5" /> Traditional ERPs (Floating Point)
              </div>
              <div className="font-mono text-xs p-4 rounded-xl bg-background/80 border border-border text-foreground/80 space-y-1 overflow-x-auto">
                <div className="text-muted-foreground">// IEEE-754 Float Precision Drift</div>
                <div>0.1 + 0.2 === <span className="text-rose-500 font-bold">0.30000000000000004</span></div>
                <div>19,450.35 * 10,000 = <span className="text-rose-500 font-bold">194503499.99999997</span></div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accumulates discrepancies over high-volume transactions, creating tax reconciliation mismatches and phantom variances during statutory audits.
              </p>
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Risk: Silent balance sheet leakage
            </div>
          </div>

          {/* Mistake Exact Integer Arithmetic Card */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <Check className="w-5 h-5" /> Mistake Platform (Exact Paise Integer)
              </div>
              <div className="font-mono text-xs p-4 rounded-xl bg-background/80 border border-border text-foreground/80 space-y-1 overflow-x-auto">
                <div className="text-emerald-500">// Pure 64-Bit Integer Math (Minor Units)</div>
                <div>10 paise + 20 paise === <span className="text-emerald-500 font-bold">30 paise (₹0.30)</span></div>
                <div>1945035 paise * 10000 = <span className="text-emerald-500 font-bold">19,45,03,50,000 paise (Exact)</span></div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zero float operations. Every unit rate, tax breakdown, and penalty is stored and computed in exact integer paise for 100% mathematical auditability.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> 100% Deterministic & Audit-Proof
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
