import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CallToAction() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-b from-primary/10 via-card to-card p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-2xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight max-w-2xl mx-auto">
          Start Recovering Lost Margin on Your Next Inbound Shipment
        </h2>

        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          Upload a sample batch of historical POs, Invoices, and GRNs. See exact line-item leakage identified within minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
              Request Free Spend Audit <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <PhoneCall className="w-4 h-4" /> Schedule Executive Walkthrough
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
