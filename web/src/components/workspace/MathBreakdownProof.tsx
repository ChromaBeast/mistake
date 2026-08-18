import React from "react";
import { MathProof } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { Calculator, ShieldAlert } from "lucide-react";

export function MathBreakdownProof({ mathProof }: { mathProof?: MathProof }) {
  if (!mathProof) {
    return (
      <Card className="bg-secondary/30 border-dashed">
        <CardContent className="p-4 flex items-center space-x-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span>Non-monetary discrepancy (Date delay / Missing documentary evidence).</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-500/30 bg-indigo-500/5">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <Calculator className="h-4 w-4 text-indigo-500" />
        <CardTitle className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Deterministic Mathematical Proof (ADR-0002)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="rounded-md bg-card/80 p-2.5 font-mono text-[11px] border border-border">
          <p className="text-muted-foreground uppercase text-[10px]">Formula:</p>
          <p className="text-foreground font-bold mt-0.5">{mathProof.formula}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-card/60 border border-border">
            <span className="text-muted-foreground text-[10px] block">PO Expected Qty</span>
            <span className="font-semibold text-foreground">{mathProof.expected_quantity}</span>
          </div>
          <div className="p-2 rounded bg-card/60 border border-border">
            <span className="text-muted-foreground text-[10px] block">Invoice Billed Qty</span>
            <span className="font-semibold text-rose-500">{mathProof.actual_quantity}</span>
          </div>
          <div className="p-2 rounded bg-card/60 border border-border">
            <span className="text-muted-foreground text-[10px] block">Unit Price (Minor)</span>
            <span className="font-semibold text-foreground">
              {formatPaiseToINR(mathProof.unit_price_minor)}
            </span>
          </div>
          <div className="p-2 rounded bg-card/60 border border-border">
            <span className="text-muted-foreground text-[10px] block">Discrepancy Delta</span>
            <span className="font-semibold text-rose-500">
              +{mathProof.quantity_delta} Units
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 font-mono">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            Total Leakage (Paise):
          </span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {formatPaiseToINR(mathProof.financial_impact_minor)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
