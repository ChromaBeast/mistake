import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldAlert, Building2, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Client-Focused Copy */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>For CFOs, Supply Chain Heads & Procurement Leaders</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Stop Procurement Leakage. <br />
              <span className="text-primary">Protect Your EBITDA Margins.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Manufacturers and distributors silently lose <strong>1% to 3% of procurement spend</strong> to rate discrepancies, short shipments, and duplicate charges. Mistake automates 3-way matching across Invoices, POs, and Goods Receipts to recover every rupee before payment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
                  Request Free Spend Audit <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <Building2 className="w-4 h-4" /> Explore Interactive Workspace
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Guaranteed ROI within 30 Days
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Non-Invasive ERP Integration
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Audit-Grade Proofs
              </span>
            </div>
          </div>

          {/* Right Column: Visual Case Example */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Vendor Rate Overcharge Detected</h3>
                    <p className="text-xs text-muted-foreground">Heavy Forged Flanges (Batch #4410)</p>
                  </div>
                </div>
                <Badge variant="danger" className="text-xs font-bold">₹1,24,000 Saved</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/50 border border-border/40 space-y-1">
                  <span className="text-muted-foreground font-medium">Agreed PO Contract Rate</span>
                  <div className="font-bold text-sm text-foreground">₹4,200.00 / Unit</div>
                  <div className="text-[10px] text-muted-foreground">Approved by Procurement</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                  <span className="text-rose-600 dark:text-rose-400 font-medium">Billed Invoice Rate</span>
                  <div className="font-bold text-sm text-rose-600 dark:text-rose-400">₹4,820.00 / Unit</div>
                  <div className="text-[10px] text-rose-500/80">+₹620.00 / Unit Unapproved Surcharge</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>Automated Recovery Action:</strong> Invoice flagged before finance approval. Automated debit note and vendor variance statement generated for accounts payable.
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                <span>Supplier: Bharat Forgings Ltd.</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Recovered Before Payout
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
