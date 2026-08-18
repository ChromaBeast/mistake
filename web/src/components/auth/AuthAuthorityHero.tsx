import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, FileSpreadsheet } from "lucide-react";

export function AuthAuthorityHero() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/20 border-r border-border/50 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Mark */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-serif font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            M
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-foreground">
            Mistake
          </span>
        </Link>
      </div>

      {/* Centerpiece: Live Forensic Reconciliation Evidence */}
      <div className="relative z-10 space-y-8 my-auto max-w-md">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold font-serif tracking-tight text-foreground leading-tight">
            Stop vendor overbilling before payment disbursement.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Autonomous 3-way reconciliation across SAP, Tally, factory weighbridges, and GST filings with exact integer paisa arithmetic.
          </p>
        </div>

        {/* Forensic Audit Simulator Widget */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-foreground" />
              <span className="font-mono text-xs font-semibold text-foreground">LEAK-8812 Reconciled</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              Pre-Payment Hold
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>PO Agreed Rate:</span>
              <span className="font-mono text-foreground font-medium">₹4,200.00 / Unit</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Supplier Invoice:</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">₹4,820.00 / Unit (+14.7%)</span>
            </div>
            <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/40">
              <span>Recovered Capital:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹1,24,000.00</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Debit note generated for accounts payable</span>
          </div>
        </div>
      </div>

      {/* Institutional Trust Badges */}
      <div className="relative z-10 pt-6 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Statutory GSTR-2B Math</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit Ledger Encryption</span>
        </div>
      </div>
    </div>
  );
}
