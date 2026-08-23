"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "#features", label: "Leak Vectors" },
  { href: "#calculator", label: "Spend Calculator" },
  { href: "#industries", label: "Industry Solutions" },
  { href: "#architecture", label: "ERP Integration" },
  { href: "#governance", label: "Governance" },
];

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-serif font-bold text-sm">
            M
          </div>
          <span className="font-bold tracking-tight text-foreground text-base font-serif">
            Mistake
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden inline-flex h-8 w-8 px-0 text-muted-foreground"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
          <Button
            href="/login"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex h-8 text-xs font-medium border-border/60"
          >
            Sign In
          </Button>
          <Button
            href="/signup"
            size="sm"
            className="h-8 text-xs font-semibold gap-1"
          >
            Request Spend Audit <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-border/50 bg-background px-4 py-3 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/40 last:border-0"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="sm:hidden block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
        </nav>
      )}
    </header>
  );
}

function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => {
        try {
          const root = document.documentElement;
          const next = root.classList.contains("dark") ? "light" : "dark";
          root.classList.toggle("dark", next === "dark");
          localStorage.setItem("mistake_theme", next);
          window.dispatchEvent(new Event("mistake-theme-change"));
        } catch {
          /* storage unavailable */
        }
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Sun className="w-4 h-4 hidden dark:block" />
      <Moon className="w-4 h-4 block dark:hidden" />
    </button>
  );
}
