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
    { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      href: "/workspace",
      label: "Findings",
      icon: <FileSearch className="h-4 w-4" />,
      badge: activeCount !== null && activeCount > 0 ? activeCount : undefined,
    },
    { href: "/ingestion", label: "Documents", icon: <FileUp className="h-4 w-4" /> },
    { href: "/entities", label: "Vendors", icon: <Users className="h-4 w-4" /> },
    { href: "/search", label: "Search", icon: <Search className="h-4 w-4" /> },
    { href: "/audit", label: "Audit log", icon: <History className="h-4 w-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
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
          "dashboard-sidebar fixed top-0 z-50 flex h-screen w-60 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 lg:z-40",
          isOpen ? "translate-x-0 left-0" : "-translate-x-full left-0 lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary font-bold text-sm">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">Mistake</span>
              <span className="text-[10px] text-muted-foreground">Finance operations</span>
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
          <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </div>
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

      </aside>
    </>
  );
}
