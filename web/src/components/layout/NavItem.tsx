"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  exact?: boolean;
}

export function NavItem({ href, label, icon, badge, exact = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <div className="flex items-center space-x-2.5">
        <span className={cn("h-4 w-4 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={cn(
            "px-1.5 py-0.5 text-[10px] font-semibold rounded-full font-mono",
            isActive
              ? "bg-white/20 text-white"
              : "bg-secondary text-secondary-foreground border border-border/40"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
