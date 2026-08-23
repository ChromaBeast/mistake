import React from "react";
import { LeakageCategory } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatPaiseToCompactINR } from "@/lib/formatters/inr";

export function LeakageCategoryChart({ categories = [] }: { categories?: LeakageCategory[] }) {
  const safeCategories = categories || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Financial Leakage by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeCategories.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No category discrepancies detected.</p>
        ) : (
          safeCategories.map((cat) => {
            const pct = Math.min(100, Math.max(0, Number(cat.percentage) || 0));
            return (
              <div key={cat.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-medium text-foreground flex items-center space-x-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">({cat.count})</span>
                  </span>
                  <div className="flex items-center space-x-2 font-mono shrink-0 tabular-nums">
                    <span className="text-muted-foreground">{Math.round(pct)}%</span>
                    <span className="font-semibold text-foreground">
                      {formatPaiseToCompactINR(cat.leakage_minor)}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
