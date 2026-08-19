import React from "react";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";

interface AuditFilterBarProps {
  actionFilter: string;
  onActionChange: (action: string) => void;
  resourceFilter: string;
  onResourceChange: (resource: string) => void;
}

export function AuditFilterBar({
  actionFilter,
  onActionChange,
  resourceFilter,
  onResourceChange,
}: AuditFilterBarProps) {
  const actions = [
    { value: "all", label: "All Actions" },
    { value: "mistake.status_updated", label: "Mistake Status Updated" },
    { value: "entity.merged", label: "Entity Merged" },
    { value: "data_source.uploaded", label: "Data Source Uploaded" },
    { value: "user.invited", label: "User Invited" },
  ];

  const resources = [
    { value: "all", label: "All Resources" },
    { value: "mistake", label: "Mistakes" },
    { value: "entity", label: "Entities" },
    { value: "data_source", label: "Data Sources" },
    { value: "tenant", label: "Tenant Settings" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-border bg-card">
      <div className="w-full sm:w-56">
        <Select
          options={actions}
          value={actionFilter}
          onChange={(e) => onActionChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          options={resources}
          value={resourceFilter}
          onChange={(e) => onResourceChange(e.target.value)}
        />
      </div>
    </div>
  );
}
