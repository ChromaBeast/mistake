"use client";

import React from "react";
import { AuditLog } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters/date";
import { ShieldCheck, Eye } from "lucide-react";

interface AuditLogTableProps {
  logs: AuditLog[];
  onViewDiff: (log: AuditLog) => void;
}

export function AuditLogTable({ logs, onViewDiff }: AuditLogTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp (ISO)</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="text-right">Audit Proof</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatDate(log.timestamp, { showTime: true })}
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-xs font-semibold text-foreground">{log.user_name}</p>
                  <p className="text-[10px] text-muted-foreground">{log.user_email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {log.resource_name || log.resource_id}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize font-mono">
                    {log.resource_type}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.ip_address || "127.0.0.1"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDiff(log)}
                  className="flex items-center space-x-1 ml-auto"
                >
                  <Eye className="h-3 w-3" />
                  <span>Inspect Diff</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
