import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-background py-12 text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs font-serif">
              M
            </div>
            <span className="font-bold tracking-tight text-foreground text-sm font-serif">
              Mistake
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              • B2B Financial Leakage & Audit Platform
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Request Audit
            </Link>
            <a
              href="https://github.com/ChromaBeast/mistake"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Source
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <div>
            © {new Date().getFullYear()} Mistake Platform. Built with Exact INR Paise Arithmetic.
          </div>
          <div className="text-muted-foreground">
            SOC-2 Type II Ready • ISO 27001 Aligned • GSTR-2B Reconciled
          </div>
        </div>
      </div>
    </footer>
  );
}
