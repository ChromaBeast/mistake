"use client";

import React from "react";
import { Search, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { useAuth } from "@/lib/context/AuthContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { Dropdown } from "@/components/ui/Dropdown";

export interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const themeItems = [
    { id: "light", label: "Light Theme", icon: <Sun className="h-4 w-4" />, onClick: () => setTheme("light") },
    { id: "dark", label: "Dark Theme", icon: <Moon className="h-4 w-4" />, onClick: () => setTheme("dark") },
    { id: "system", label: "System Default", icon: <Laptop className="h-4 w-4" />, onClick: () => setTheme("system") },
  ];

  const userItems = [
    { id: "profile", label: `${user?.name || "User"} (${user?.role || "Viewer"})`, onClick: () => {} },
    { id: "logout", label: "Sign out", danger: true, onClick: () => logout() },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-slate-400 hover:text-foreground transition-all w-64 md:w-80 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search entities, orders, leaks...</span>
          </div>
          <kbd className="hidden rounded bg-card px-1.5 py-0.5 text-[10px] font-mono border border-border shadow-xs sm:inline-block">
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
              aria-label="Theme mode"
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>
          }
          items={themeItems}
        />

        <NotificationDropdown />

        <div className="h-4 w-px bg-border mx-1" />

        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center space-x-2 cursor-pointer rounded-lg p-1 hover:bg-secondary transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-foreground leading-none">{user?.name || "Aditya Verma"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user?.role || "Owner"}</p>
              </div>
            </div>
          }
          items={userItems}
        />
      </div>
    </header>
  );
}
