import React from "react";
import { BusinessEvent } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters/date";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { Clock, Calendar, AlertCircle } from "lucide-react";

export function MultiSourceTimeline({ events }: { events: BusinessEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-xs text-muted-foreground">No chronological event history recorded.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Multi-Source Chronological Timeline</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            occurred_at vs observed_at
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative pl-6 border-l-2 border-border/80 space-y-6">
          {events.map((evt) => {
            const isDateOnly = evt.occurred_at_precision === "date_only";
            const occurredTime = new Date(evt.occurred_at).getTime();
            const observedTime = new Date(evt.observed_at).getTime();
            const isRetroactive = observedTime < occurredTime;

            return (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
                <div className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold text-foreground">{evt.title}</span>
                    <Badge variant="outline" size="sm" className="uppercase font-mono text-[10px]">
                      {evt.source_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{evt.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-center space-x-1.5 font-mono">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>
                        Occurred: {formatDate(evt.occurred_at, { precision: isDateOnly ? "date_only" : undefined })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 font-mono">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>Observed: {formatDate(evt.observed_at, { showTime: true })}</span>
                    </div>
                  </div>

                  {isRetroactive && (
                    <div className="flex items-center space-x-1 text-[10px] text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>Clock Variance: Recorded event is dated ahead of ingestion observation.</span>
                    </div>
                  )}

                  {evt.amount_minor && (
                    <div className="text-xs font-mono font-semibold text-foreground pt-1">
                      Event Value: {formatPaiseToINR(evt.amount_minor)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
