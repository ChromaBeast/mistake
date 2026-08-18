import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India-First • Exact Integer Paise Arithmetic</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Catch Financial Leakage <br />
              <span className="text-primary">Before It Hits Your P&L.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Automated 3-way reconciliation across Purchase Orders, Goods Receipt Notes, and Invoices. 
              Deterministic detection for price variances, short deliveries, and duplicate billings with audit-ready proof.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Live Investigation Deck
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Float Errors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5-Tier RBAC
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Immutable Audit Trail
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Discrepancy Evidence Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Critical Price Mismatch</h3>
                    <p className="text-xs text-muted-foreground font-mono">PO-2026-8812 ⟷ INV-9042</p>
                  </div>
                </div>
                <Badge variant="danger" className="text-xs font-mono">₹1,24,000 Leak</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/50 border border-border/40 space-y-1">
                  <span className="text-muted-foreground font-medium">Purchase Order Rate</span>
                  <div className="font-mono font-bold text-sm text-foreground">₹4,200.00 / Unit</div>
                  <div className="text-[10px] text-muted-foreground">PO-2026-8812 (Line 4)</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                  <span className="text-rose-600 dark:text-rose-400 font-medium">Billed Invoice Rate</span>
                  <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">₹4,820.00 / Unit</div>
                  <div className="text-[10px] text-rose-500/80">+₹620.00 (+14.7%) Overbilled</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Deterministic Proof:</span> 200 units billed at ₹4,820 vs agreed master PO rate ₹4,200. Total excess claim: <strong>12,400,000 paise (₹1,24,000.00)</strong>.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-muted-foreground border-t border-border/40">
                <span>Vendor: Bharat Forgings Ltd.</span>
                <span className="text-emerald-500 font-semibold">Confidence: 99.8%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
