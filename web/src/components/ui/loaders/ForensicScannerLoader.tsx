"use client";

import React, { useState, useEffect } from "react";
import { Search, ShieldCheck, Scale, FileText, CheckCircle2 } from "lucide-react";

interface ForensicScannerLoaderProps {
  message?: string;
  className?: string;
}

const STAGES = [
  { icon: FileText, label: "Cross-checking Master Purchase Order terms..." },
  { icon: Scale, label: "Verifying Weighbridge GRN tare & net weights..." },
  { icon: Search, label: "Validating GSTIN, HSN & tax slab schedules..." },
  { icon: ShieldCheck, label: "Computing 64-bit integer paise reconciliation..." },
];

export function ForensicScannerLoader({
  message = "Forensic Ledger Reconciliation in Progress",
  className = "",
}: ForensicScannerLoaderProps) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % STAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = STAGES[stageIdx].icon;

  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 space-y-6 ${className}`}>
      {/* Scanner Target Circle with Radar Pulse */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-radar" />
        <div className="relative w-14 h-14 rounded-full border border-border bg-card shadow-sm flex items-center justify-center text-foreground">
          <ActiveIcon className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Title & Active Stage */}
      <div className="text-center space-y-2 max-w-sm">
        <div className="font-serif text-base font-bold text-foreground tracking-tight">
          {message}
        </div>
        <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-muted-foreground animate-fade-in key={stageIdx}">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{STAGES[stageIdx].label}</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1.5 pt-2">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              stageIdx === i
                ? "w-6 bg-foreground"
                : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
