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
    <Card className="h-full">
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
                <span className="capitalize">{t.replace("_", " ")}</span>
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
  );
}
