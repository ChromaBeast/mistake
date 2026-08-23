import React from "react";
import { Entity } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPaiseToINR, formatPaiseToCompactINR } from "@/lib/formatters/inr";
import { Building2, ShieldAlert } from "lucide-react";

export function EntityDetailHeader({ entity }: { entity: Entity }) {
  return (
    <Card className="bg-card">
      <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary mt-1">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-foreground">{entity.canonical_name}</h2>
              <Badge
                variant={
                  entity.type === "Supplier"
                    ? "info"
                    : entity.type === "Customer"
                      ? "success"
                      : "outline"
                }
              >
                {entity.type}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
              <span>GSTIN: {entity.gstin || "N/A"}</span>
              <span>•</span>
              <span>PAN: {entity.pan || "N/A"}</span>
              <span>•</span>
              <span>Orders: {entity.total_orders_count}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Total Volume (INR)
            </span>
            <span className="text-lg font-bold text-foreground font-mono">
              {formatPaiseToCompactINR(entity.total_volume_minor)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Risk Score
            </span>
            <span
              className={`text-lg font-bold font-mono ${
                entity.risk_score > 60
                  ? "text-rose-500"
                  : entity.risk_score > 30
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {entity.risk_score}/100
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
