import React from "react";
import { LeakageCategory } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatPaiseToCompactINR, formatPaiseToINR } from "@/lib/formatters/inr";

export function LeakageCategoryChart({ categories }: { categories: LeakageCategory[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Financial Leakage by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.type} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center space-x-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">({cat.count})</span>
              </span>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-muted-foreground">{cat.percentage}%</span>
                <span className="font-semibold text-foreground">
                  {formatPaiseToCompactINR(cat.leakage_minor)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
