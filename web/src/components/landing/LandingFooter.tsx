import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-foreground text-sm">
            MISTAKE
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            • Financial Leakage Detection
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Get Started
          </Link>
          <a
            href="https://github.com/ChromaBeast/mistake"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub Repository
          </a>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} Mistake Platform. India-First INR Minor Units.
        </div>
      </div>
    </footer>
  );
}
