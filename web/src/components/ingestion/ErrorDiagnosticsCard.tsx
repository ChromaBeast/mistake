import React from "react";
import { IngestionError } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AlertTriangle, Wrench, FileWarning } from "lucide-react";

export function ErrorDiagnosticsCard({ error }: { error: IngestionError }) {
  return (
    <Card className="border-rose-500/30 bg-rose-500/5">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            Ingestion Diagnostic: {error.title}
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-mono">Error Code: {error.code}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-start space-x-2 text-foreground">
          <FileWarning className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">File:</span> {error.file_name}
            {error.line_number && <span className="font-mono ml-1">(Line {error.line_number})</span>}
            <p className="text-muted-foreground mt-0.5">{error.description}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2 rounded-lg bg-card/60 p-2.5 border border-border/60">
          <Wrench className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Recommended Resolution:
            </span>
            <p className="text-muted-foreground mt-0.5">{error.recommended_action}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
