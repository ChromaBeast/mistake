import React from "react";
import { MistakeTransition } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters/date";
import { History, ArrowRight } from "lucide-react";

export function TransitionHistoryLog({
  transitions = [],
}: {
  transitions?: MistakeTransition[];
}) {
  if (transitions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold flex items-center space-x-1.5 text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          <span>Status Transition & Audit Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="divide-y divide-border/60">
          {transitions.map((tr) => (
            <div key={tr.id} className="py-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                    {tr.from_status}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="info" size="sm" className="font-mono text-[10px]">
                    {tr.to_status}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {formatDate(tr.created_at, { showTime: true })}
                </span>
              </div>
              <p className="text-[11px] text-foreground font-medium">By {tr.user_name}</p>
              {tr.reason && (
                <p className="text-xs text-muted-foreground bg-secondary/50 p-1.5 rounded border border-border/40">
                  Reason: &ldquo;{tr.reason}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
