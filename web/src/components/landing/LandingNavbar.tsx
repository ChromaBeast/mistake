"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { Button } from "@/components/ui/Button";

export function LandingNavbar() {
  const { isDark, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center font-black text-xs">
            M
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-foreground text-sm uppercase font-serif">
              MISTAKE
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground">
              Audit Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#reconciliation" className="hover:text-foreground transition-colors">
            3-Way Reconciliation
          </a>
          <a href="#calculator" className="hover:text-foreground transition-colors">
            Spend Calculator
          </a>
          <a href="#industries" className="hover:text-foreground transition-colors">
            Industry Solutions
          </a>
          <a href="#architecture" className="hover:text-foreground transition-colors">
            ERP Integration
          </a>
          <a href="#governance" className="hover:text-foreground transition-colors">
            Governance
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-border/60">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1">
              Request Spend Audit <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
