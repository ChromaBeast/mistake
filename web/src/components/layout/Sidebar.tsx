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
  ShieldAlert,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { TenantSwitcher } from "./TenantSwitcher";

export function Sidebar() {
  const mainNav = [
    { href: "/dashboard", label: "Business Health", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/ingestion", label: "Ingestion Hub", icon: <UploadCloud className="h-4 w-4" />, badge: "Active" },
    { href: "/workspace", label: "Investigation Workspace", icon: <FileSearch className="h-4 w-4" />, badge: 4 },
    { href: "/entities", label: "Entity Explorer", icon: <Users className="h-4 w-4" /> },
    { href: "/search", label: "Global Search", icon: <Search className="h-4 w-4" /> },
    { href: "/audit", label: "Audit Trail", icon: <History className="h-4 w-4" /> },
    { href: "/settings", label: "Settings & Admin", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">Mistake</span>
            <span className="text-[10px] text-muted-foreground font-mono">Leakage Detection</span>
          </div>
        </Link>
      </div>

      <div className="p-3">
        <TenantSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Core Platform
        </div>
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-secondary/60 p-2.5 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Growth Plan</span>
            <span className="text-[10px] text-emerald-500 font-medium">Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">₹14,999/mo • Unlimited leaks</p>
        </div>
      </div>
    </aside>
  );
}
