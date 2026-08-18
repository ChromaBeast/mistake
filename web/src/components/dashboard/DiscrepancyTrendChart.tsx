import React from "react";
import { DiscrepancyTrendPoint } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatPaiseToCompactINR } from "@/lib/formatters/inr";

export function DiscrepancyTrendChart({ data }: { data: DiscrepancyTrendPoint[] }) {
  const maxPaise = Math.max(...data.map((d) => d.detected_paise), 1);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Detection & Resolution Trend</CardTitle>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-muted-foreground">Detected Leakage</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Resolved Value</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end space-x-6 pt-4">
          {data.map((point, idx) => {
            const detectedHeight = Math.round((point.detected_paise / maxPaise) * 100);
            const resolvedHeight = Math.round((point.resolved_paise / maxPaise) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                <div className="flex items-end space-x-1.5 w-full justify-center h-36">
                  {/* Detected bar */}
                  <div
                    className="w-4 bg-rose-500/80 hover:bg-rose-500 rounded-t transition-all"
                    style={{ height: `${Math.max(detectedHeight, 8)}%` }}
                    title={`Detected: ${formatPaiseToCompactINR(point.detected_paise)}`}
                  />
                  {/* Resolved bar */}
                  <div
                    className="w-4 bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${Math.max(resolvedHeight, 4)}%` }}
                    title={`Resolved: ${formatPaiseToCompactINR(point.resolved_paise)}`}
                  />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
