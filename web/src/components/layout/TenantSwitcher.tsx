"use client";

import React from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

export function TenantSwitcher() {
  const { tenant } = useAuth();

  const mockTenants = [
    { id: "ten-001", name: tenant?.name || "Bharat Heavy Engineering Ltd" },
    { id: "ten-002", name: "Apex Logistics Hub (North)" },
  ];

  const items: DropdownItem[] = mockTenants.map((t) => ({
    id: t.id,
    label: t.name,
    icon: t.id === tenant?.id ? <Check className="h-4 w-4 text-primary" /> : undefined,
    onClick: () => {
      console.log("Switching tenant:", t.id);
    },
  }));

  return (
    <Dropdown
      align="left"
      trigger={
        <div className="flex items-center space-x-2 rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground truncate max-w-[140px]">
            {tenant?.name || "Bharat Heavy Eng"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      }
      items={items}
    />
  );
}
