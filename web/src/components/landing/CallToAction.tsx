import React from "react";
import Link from "next/link";
import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CallToAction() {
  return (
    <section className="py-20 border-b border-border bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Ready to Recover Undetected Capital Across Your Supply Chain?
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Provide a sample batch of historical POs and supplier invoices. We will run our 5-engine reconciliation pipeline and deliver an audit summary of recoverable capital within 48 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-11 px-8 text-sm font-semibold gap-2">
              Request Sample Spend Audit <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 px-6 text-sm font-medium gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Open Investigation Workspace
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
