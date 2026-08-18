"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-serif font-bold text-sm">
            M
          </div>
          <span className="font-bold tracking-tight text-foreground text-base font-serif">
            Mistake
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Leak Vectors
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
