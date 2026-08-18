"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { Button } from "@/components/ui/Button";

export function LandingNavbar() {
  const { isDark, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-foreground text-lg leading-none">
              MISTAKE
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">
              FINANCIAL AUDIT & LEAKAGE
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Leakage Sources
          </a>
          <a href="#metrics" className="hover:text-foreground transition-colors">
            ROI Impact
          </a>
          <a href="#math-proof" className="hover:text-foreground transition-colors">
            Audit Precision
          </a>
          <a href="#governance" className="hover:text-foreground transition-colors">
            Enterprise Controls
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="gap-1.5">
              Free Audit <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
