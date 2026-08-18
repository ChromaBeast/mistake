"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { VERTICALS } from "./industryData";

export function IndustrySolutionsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % VERTICALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = VERTICALS[activeIdx];
  const Icon = current.icon;

  return (
    <section id="industries" className="py-20 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Built for heavy industrial operations.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every vertical presents distinct contracting nuances and receiving realities. Explore tailored detection rules for your supply chain.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveIdx((prev) => (prev === 0 ? VERTICALS.length - 1 : prev - 1))}
              className="p-2 rounded border border-border bg-card hover:bg-muted text-foreground transition-colors"
              aria-label="Previous Industry"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-muted-foreground px-2">
              0{activeIdx + 1} / 0{VERTICALS.length}
            </span>
            <button
              onClick={() => setActiveIdx((prev) => (prev + 1) % VERTICALS.length)}
              className="p-2 rounded border border-border bg-card hover:bg-muted text-foreground transition-colors"
              aria-label="Next Industry"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Industry Selector Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-border">
          {VERTICALS.map((v, i) => {
            const VIcon = v.icon;
            const isActive = activeIdx === i;
            return (
              <button
                key={v.id}
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium rounded-md whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-foreground text-background border-foreground font-semibold shadow-sm"
                    : "bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                <VIcon className="w-4 h-4 shrink-0" />
                <span>{v.sector}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Showcase Stage */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="border border-border bg-card rounded-lg p-6 md:p-10 transition-all duration-300"
        >
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Context Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground font-serif">
                  {current.sector}
                </h3>
                <p className="text-xs font-medium text-muted-foreground">
                  {current.focus}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {current.summary}
              </p>

              <div className="p-4 rounded border border-border/80 bg-muted/20 space-y-1">
                <div className="font-mono text-[11px] text-muted-foreground uppercase">Historical Leakage Risk</div>
                <div className="font-mono text-xl font-bold text-rose-600 dark:text-rose-400">
                  {current.leakRate}
                </div>
              </div>
            </div>

            {/* Right Column: Forensic Detection Checks */}
            <div className="lg:col-span-7 space-y-3 lg:border-l lg:border-border/60 lg:pl-8">
              <div className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Active Industrial Verification Rules
              </div>

              {current.checks.map((c, j) => (
                <div
                  key={j}
                  className="p-4 rounded border border-border/80 bg-background/80 hover:border-foreground/30 transition-colors space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-bold text-sm text-foreground">{c.title}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.auditAction}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {c.detail}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
