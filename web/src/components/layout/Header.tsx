"use client";

import React from "react";
import { Search, Sun, Moon, Laptop, Menu } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { useAuth } from "@/lib/context/AuthContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { Dropdown } from "@/components/ui/Dropdown";

export interface HeaderProps {
  onOpenSearch?: () => void;
  onToggleSidebar?: () => void;
}

export function Header({ onOpenSearch, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const themeItems = [
    { id: "light", label: "Light Theme", icon: <Sun className="h-3.5 w-3.5" />, onClick: () => setTheme("light") },
    { id: "dark", label: "Dark Theme", icon: <Moon className="h-3.5 w-3.5" />, onClick: () => setTheme("dark") },
    { id: "system", label: "System Default", icon: <Laptop className="h-3.5 w-3.5" />, onClick: () => setTheme("system") },
  ];

  const userItems = [
    { id: "profile", label: `${user?.name || "User"} (${user?.role || "Viewer"})`, onClick: () => {} },
    { id: "logout", label: "Sign Out", danger: true, onClick: () => logout() },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-4 sm:px-6 backdrop-blur-sm">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation drawer"
            className="lg:hidden rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2.5 rounded border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-48 sm:w-64 md:w-80 justify-between"
          aria-label="Global search shortcut"
        >

          <div className="flex items-center space-x-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search invoices, POs, vendors...</span>
          </div>
          <kbd className="hidden rounded bg-card px-1.5 py-0.5 text-[10px] font-mono border border-border sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="Toggle theme"
              className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Moon className="h-3.5 w-3.5 text-foreground" /> : <Sun className="h-3.5 w-3.5 text-foreground" />}
            </button>
          }
          items={themeItems}
        />

        <NotificationDropdown />

        <div className="h-4 w-px bg-border mx-1" />

        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center space-x-2 cursor-pointer rounded p-1 hover:bg-muted transition-colors">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background text-[11px] font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-foreground leading-none">{user?.name || "Aditya Verma"}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{user?.role || "Owner"}</p>
              </div>
            </div>
          }
          items={userItems}
        />
      </div>
    </header>
  );
}
