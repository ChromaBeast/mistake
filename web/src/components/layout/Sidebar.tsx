"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileUp,
  FileSearch,
  Users,
  Search,
  History,
  Settings,
  X,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { TenantSwitcher } from "./TenantSwitcher";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils/cn";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeCount, setActiveCount] = useState<number | null>(null);

  // Refresh the "detected" badge count whenever the route changes so it
  // stays accurate after findings are triaged elsewhere.
  const [routeKey, setRouteKey] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onRouteChange = () => setRouteKey((k) => k + 1);
    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const list = await api.getMistakes({ status: "detected" });
        if (!cancelled && Array.isArray(list)) setActiveCount(list.length);
      } catch {
        if (!cancelled) setActiveCount(null);
      }
    }
    fetchCount();
    return () => {
      cancelled = true;
    };
  }, [routeKey]);

  // Escape closes the mobile drawer; lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const mainNav = [
    { href: "/dashboard", label: "Executive Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    {
      href: "/workspace",
      label: "3-Way Investigation",
      icon: <FileSearch className="h-3.5 w-3.5" />,
      badge: activeCount !== null && activeCount > 0 ? `${activeCount} Active` : undefined,
    },
    { href: "/ingestion", label: "Ingestion Pipeline", icon: <FileUp className="h-3.5 w-3.5" /> },
    { href: "/entities", label: "Entity Directory", icon: <Users className="h-3.5 w-3.5" /> },
    { href: "/search", label: "Search & Lookup", icon: <Search className="h-3.5 w-3.5" /> },
    { href: "/audit", label: "Statutory Audit Log", icon: <History className="h-3.5 w-3.5" /> },
    { href: "/settings", label: "Admin & Settings", icon: <Settings className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Primary navigation"
        className={cn(
          "fixed top-0 z-50 flex h-screen w-60 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 lg:z-40",
          isOpen ? "translate-x-0 left-0" : "-translate-x-full left-0 lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
            <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background font-black text-xs">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-foreground uppercase">Mistake</span>
              <span className="text-[9px] text-muted-foreground font-mono">Enterprise Audit</span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-3 border-b border-border">
          <TenantSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" onClick={onClose}>
          <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            Platform Navigation
          </div>
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

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
    </>
  );
}
