import React from "react";
import { DiscrepancyTrendPoint } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatPaiseToCompactINR } from "@/lib/formatters/inr";

export function DiscrepancyTrendChart({ data = [] }: { data?: DiscrepancyTrendPoint[] }) {
  const safeData = Array.isArray(data) ? data : [];
  const maxPaise = Math.max(...safeData.map((d) => d.detected_paise || d.resolved_paise || 0), 1);

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
        {safeData.length === 0 ? (
          <p className="text-xs text-muted-foreground py-16 text-center">
            No trend data yet — upload documents to build the detection timeline.
          </p>
        ) : (
          <div className="overflow-x-auto pb-1">
            <div className="flex h-48 items-end gap-4 sm:gap-6 pt-4 min-w-[280px]">
              {safeData.map((point) => {
                const detectedHeight = Math.round(((point.detected_paise || 0) / maxPaise) * 100);
                const resolvedHeight = Math.round(((point.resolved_paise || 0) / maxPaise) * 100);

                return (
                  <div key={point.date} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                    <div className="flex items-end space-x-1.5 w-full justify-center h-36">
                      {/* Detected bar */}
                      <div
                        role="img"
                        aria-label={`${point.date}: detected ${formatPaiseToCompactINR(point.detected_paise)}`}
                        className={`w-4 rounded-t transition-all ${
                          detectedHeight > 0 ? "bg-rose-500/80 hover:bg-rose-500" : "bg-transparent"
                        }`}
                        style={{ height: `${detectedHeight}%`, minHeight: detectedHeight > 0 ? "3px" : 0 }}
                        title={`Detected: ${formatPaiseToCompactINR(point.detected_paise)}`}
                      />
                      {/* Resolved bar */}
                      <div
                        role="img"
                        aria-label={`${point.date}: resolved ${formatPaiseToCompactINR(point.resolved_paise)}`}
                        className={`w-4 rounded-t transition-all ${
                          resolvedHeight > 0 ? "bg-emerald-500/80 hover:bg-emerald-500" : "bg-transparent"
                        }`}
                        style={{ height: `${resolvedHeight}%`, minHeight: resolvedHeight > 0 ? "3px" : 0 }}
                        title={`Resolved: ${formatPaiseToCompactINR(point.resolved_paise)}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                      {point.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
