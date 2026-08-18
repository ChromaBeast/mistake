import React from "react";
import Link from "next/link";
import { SearchResult } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPaiseToINR } from "@/lib/formatters/inr";
import { ArrowRight, Building2, AlertTriangle, FileText } from "lucide-react";

export function SearchResultList({ results }: { results: SearchResult[] }) {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <p className="text-xs text-muted-foreground">
          No matching records found. Try adjusting your filters or search keywords.
        </p>
      </Card>
    );
  }

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "entity":
        return <Building2 className="h-4 w-4 text-primary" />;
      case "mistake":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      {results.map((item) => (
        <Card key={item.id} hoverable>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-secondary mt-0.5">{getIcon(item.type)}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                  {item.badge && <Badge size="sm">{item.badge}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {item.financial_impact_minor && (
                <span className="text-xs font-bold text-rose-500 font-mono">
                  {formatPaiseToINR(item.financial_impact_minor)}
                </span>
              )}
              <Link
                href={item.url}
                className="inline-flex items-center space-x-1 text-xs font-medium text-primary hover:underline"
              >
                <span>View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
