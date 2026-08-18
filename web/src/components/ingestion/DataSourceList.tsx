import React from "react";
import { DataSource } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters/date";
import { FileText, FileSpreadsheet, RotateCcw, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface DataSourceListProps {
  dataSources: DataSource[];
  onRetry: (id: string) => Promise<void>;
  onSelect?: (ds: DataSource) => void;
}

export function DataSourceList({ dataSources, onRetry, onSelect }: DataSourceListProps) {
  const getStatusBadge = (status: DataSource["status"]) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" /><span>Completed</span></Badge>;
      case "Failed":
        return <Badge variant="danger" className="flex items-center space-x-1"><AlertTriangle className="h-3 w-3" /><span>Failed</span></Badge>;
      case "Extracting":
      case "Analyzing":
      case "Processing":
        return <Badge variant="info" className="flex items-center space-x-1"><Clock className="h-3 w-3 animate-spin" /><span>{status}</span></Badge>;
      default:
        return <Badge variant="default">Queued</Badge>;
    }
  };

  const getFormatIcon = (format: DataSource["format"]) => {
    if (format === "csv" || format === "xlsx") {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
    }
    return <FileText className="h-4 w-4 text-rose-500" />;
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File / Data Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Extracted Records</TableHead>
            <TableHead>Mistakes Found</TableHead>
            <TableHead>Uploaded At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataSources.map((ds) => (
            <TableRow
              key={ds.id}
              onClick={() => onSelect?.(ds)}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2.5">
                  {getFormatIcon(ds.format)}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{ds.file_name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {(ds.file_size_bytes / (1024 * 1024)).toFixed(2)} MB • by {ds.uploaded_by_name || "User"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(ds.status)}</TableCell>
              <TableCell className="font-mono text-xs">
                {ds.total_records_extracted.toLocaleString("en-IN")}
              </TableCell>
              <TableCell>
                {ds.mistakes_found_count > 0 ? (
                  <Badge variant="warning">{ds.mistakes_found_count} Flags</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {formatDate(ds.uploaded_at, { showTime: true })}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                {ds.status === "Failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(ds.id)}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
