import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FilterSidebarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  selectedSeverity: string;
  onSelectSeverity: (severity: string) => void;
  onReset: () => void;
}

export function FilterSidebar({
  selectedType,
  onSelectType,
  selectedSeverity,
  onSelectSeverity,
  onReset,
}: FilterSidebarProps) {
  const types = ["all", "quantity_mismatch", "price_mismatch", "missing_evidence", "date_mismatch", "status_mismatch"];
  const severities = ["all", "critical", "high", "medium", "low"];

  return (
    <>
      {/* Mobile Horizontal Filter Chips */}
      <div className="lg:hidden space-y-2 p-3 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Filters</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onReset} className="h-6 px-2 text-[10px]">
            <RotateCcw className="h-2.5 w-2.5 mr-1" />
            Reset
          </Button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => onSelectType(t)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-colors ${
                selectedType === t
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-border/50">
          {severities.map((s) => (
            <button
              key={s}
              onClick={() => onSelectSeverity(s)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap text-[10px] uppercase font-mono tracking-wider transition-colors ${
                selectedSeverity === s
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Faceted Filter Card */}
      <Card className="hidden lg:block h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-xs font-semibold flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Faceted Filters</span>
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onReset} className="h-7 px-2 text-[10px]">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-foreground block">Discrepancy Category</span>
            <div className="flex flex-col space-y-1">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => onSelectType(t)}
                  className={`flex items-center justify-between p-1.5 rounded-md text-left transition-colors ${
                    selectedType === t
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="capitalize">{t.replace(/_/g, " ")}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <span className="font-semibold text-foreground block">Severity Level</span>
            <div className="flex flex-col space-y-1">
              {severities.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSeverity(s)}
                  className={`flex items-center justify-between p-1.5 rounded-md text-left transition-colors ${
                    selectedSeverity === s
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="capitalize">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
