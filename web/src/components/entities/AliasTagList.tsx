import React from "react";
import { EntityAlias } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tag, CheckCircle2 } from "lucide-react";

export function AliasTagList({ aliases }: { aliases: EntityAlias[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <Tag className="h-4 w-4 text-primary" />
          <span>Resolved Name Aliases ({aliases.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {aliases.length === 0 ? (
          <p className="text-xs text-muted-foreground">No variant name aliases recorded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <div
                key={alias.id}
                className="flex items-center space-x-2 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs"
              >
                <span className="font-medium text-foreground">{alias.alias_name}</span>
                <Badge variant="success" size="sm" className="font-mono text-[10px]">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  {alias.confidence_score}% Match
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
