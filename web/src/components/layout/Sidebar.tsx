"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  Users,
  Search,
  History,
  Settings,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { TenantSwitcher } from "./TenantSwitcher";

export function Sidebar() {
  const mainNav = [
    { href: "/dashboard", label: "Executive Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { href: "/workspace", label: "3-Way Investigation", icon: <FileSearch className="h-3.5 w-3.5" />, badge: "4 Active" },
    { href: "/ingestion", label: "Ingestion Pipeline", icon: <UploadCloud className="h-3.5 w-3.5" /> },
    { href: "/entities", label: "Entity Directory", icon: <Users className="h-3.5 w-3.5" /> },
    { href: "/search", label: "Search & Lookup", icon: <Search className="h-3.5 w-3.5" /> },
    { href: "/audit", label: "Statutory Audit Log", icon: <History className="h-3.5 w-3.5" /> },
    { href: "/settings", label: "Admin & Settings", icon: <Settings className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background font-black text-xs">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-foreground uppercase">Mistake</span>
            <span className="text-[9px] text-muted-foreground font-mono">Enterprise Audit</span>
          </div>
        </Link>
      </div>

      <div className="p-3 border-b border-border">
        <TenantSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          Platform Navigation
        </div>
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="p-2 border border-border bg-muted/20 text-xs">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="font-semibold text-foreground">ENTERPRISE TIER</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">Paise-Precision Matching</p>
        </div>
      </div>
    </aside>
  );
}
