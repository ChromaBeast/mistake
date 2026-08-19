"use client";

import React from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

export function TenantSwitcher() {
  const { tenant } = useAuth();

  const items: DropdownItem[] = [
    {
      id: tenant?.id || "current-org",
      label: `${tenant?.name || "Enterprise Organization"} (Active)`,
      icon: <Check className="h-4 w-4 text-emerald-500" />,
      onClick: () => {},
    },
  ];

  return (
    <Dropdown
      align="left"
      trigger={
        <div className="flex items-center justify-between w-full rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors cursor-pointer select-none">
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[130px]">
              {tenant?.name || "Enterprise Org"}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </div>
      }
      items={items}
    />
  );
}
