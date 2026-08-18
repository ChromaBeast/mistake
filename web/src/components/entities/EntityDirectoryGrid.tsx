import React from "react";
import Link from "next/link";
import { Entity } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatPaiseToCompactINR } from "@/lib/formatters/inr";
import { Building2, ArrowRight } from "lucide-react";

interface EntityDirectoryGridProps {
  entities: Entity[];
}

export function EntityDirectoryGrid({ entities }: EntityDirectoryGridProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Counterparty Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>GSTIN / Tax ID</TableHead>
            <TableHead>Aliases</TableHead>
            <TableHead>Total Volume</TableHead>
            <TableHead>Active Flags</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((ent) => (
            <TableRow key={ent.id}>
              <TableCell className="font-semibold text-xs text-foreground">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{ent.canonical_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={ent.type === "Supplier" ? "info" : "success"}>
                  {ent.type}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {ent.gstin || "—"}
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">{ent.aliases.length} aliases</span>
              </TableCell>
              <TableCell className="font-mono text-xs font-semibold">
                {formatPaiseToCompactINR(ent.total_volume_minor)}
              </TableCell>
              <TableCell>
                {ent.active_mistakes_count > 0 ? (
                  <Badge variant="danger">{ent.active_mistakes_count} Open</Badge>
                ) : (
                  <Badge variant="success">0 Clear</Badge>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`font-mono font-bold text-xs ${
                    ent.risk_score > 60
                      ? "text-rose-500"
                      : ent.risk_score > 30
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {ent.risk_score}/100
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/entities/${ent.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-primary hover:underline"
                >
                  <span>Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
