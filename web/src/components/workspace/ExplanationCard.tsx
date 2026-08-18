import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Sparkles, ArrowRightCircle } from "lucide-react";

export function ExplanationCard({
  explanation,
  remediationAdvice,
}: {
  explanation: string;
  remediationAdvice: string[];
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <CardTitle className="text-sm font-semibold">Root Cause Explanation & Remediation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div>
          <h5 className="font-semibold text-foreground mb-1">Observation Summary:</h5>
          <p className="text-muted-foreground leading-relaxed">{explanation}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <h5 className="font-semibold text-foreground">Recommended Actions:</h5>
          <div className="space-y-1.5">
            {remediationAdvice.map((advice, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-muted-foreground">
                <ArrowRightCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">{advice}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
