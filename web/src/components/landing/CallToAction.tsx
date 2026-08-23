import React from "react";
import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CallToAction() {
  return (
    <section className="py-20 sm:py-24 border-b border-border bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
          Your vendors already found the margin. Take it back before payment runs.
        </h2>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Provide a sample batch of historical POs and supplier invoices. Our 5-engine
          reconciliation pipeline delivers an audit summary of recoverable capital —
          down to the last paise — within 48 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Button
            href="/#contact"
            size="lg"
            className="w-full sm:w-auto h-11 px-8 text-sm font-semibold gap-2"
          >
            Request Sample Spend Audit <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            href="/login"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 text-sm font-medium gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Open Investigation Workspace
          </Button>
        </div>
      </div>
    </section>
  );
}
