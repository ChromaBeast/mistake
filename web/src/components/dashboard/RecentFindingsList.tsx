import React from "react";
import Link from "next/link";
import { Mistake } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { formatRelativeTime } from "@/lib/formatters/date";
import { ArrowRight, AlertTriangle } from "lucide-react";

export function RecentFindingsList({ findings }: { findings: Mistake[] }) {
  const severityBadge = (sev: Mistake["severity"]) => {
    switch (sev) {
      case "critical":
        return <Badge variant="danger">Critical</Badge>;
      case "high":
        return <Badge variant="warning">High</Badge>;
      case "medium":
        return <Badge variant="info">Medium</Badge>;
      default:
        return <Badge variant="default">Low</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">High Impact Findings</CardTitle>
        <Link
          href="/workspace"
          className="text-xs font-medium text-primary hover:underline flex items-center space-x-1"
        >
          <span>Open Workspace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="p-3 rounded-full bg-muted text-muted-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No financial findings detected</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Ingest vendor invoices, purchase orders, or payment ledgers to let the engine detect discrepancies.
            </p>
            <Link
              href="/ingestion"
              className="text-xs text-primary font-medium hover:underline pt-1 inline-flex items-center space-x-1"
            >
              <span>Go to Ingestion Pipeline</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {findings.map((item) => (
              <Link
                key={item.id}
                href={`/workspace/${item.id}`}
                className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-secondary text-foreground">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-muted-foreground">
                      <span>{item.entity_name}</span>
                      <span>•</span>
                      <span className="font-mono">{formatRelativeTime(item.detected_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <div className="text-xs font-bold text-rose-500 font-mono tabular-nums">
                      {formatPaiseToINR(item.financial_impact_minor)}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">{item.status}</span>
                  </div>
                  {severityBadge(item.severity)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

