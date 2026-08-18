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
    <section id="industries" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Minimalist Header with Organic Pagination */}
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
              className="p-2 rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground transition-all duration-150 active:scale-95"
              aria-label="Previous Industry"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-muted-foreground px-2">
              0{activeIdx + 1} / 0{VERTICALS.length}
            </span>
            <button
              onClick={() => setActiveIdx((prev) => (prev + 1) % VERTICALS.length)}
              className="p-2 rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground transition-all duration-150 active:scale-95"
              aria-label="Next Industry"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Natural Floating Tab Selector (No Bottom Divider) */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
          {VERTICALS.map((v, i) => {
            const VIcon = v.icon;
            const isActive = activeIdx === i;
            return (
              <button
                key={v.id}
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-sm"
                    : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <VIcon className="w-4 h-4 shrink-0" />
                <span>{v.sector}</span>
              </button>
            );
          })}
        </div>

        {/* Organic Unified Stage (No Artificial Dividers) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="rounded-2xl border border-border/70 bg-card p-6 md:p-8 space-y-8 shadow-xs hover:border-foreground/20 transition-all duration-300"
        >
          {/* Top Headline & Context Flow */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-center text-foreground shrink-0 mt-1">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground font-serif">
                  {current.sector}
                </h3>
                <p className="text-xs font-medium text-muted-foreground">
                  {current.focus}
                </p>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed pt-1">
                  {current.summary}
                </p>
              </div>
            </div>

            {/* Risk Badge */}
            <div className="self-start lg:self-center px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0">
              <div className="font-mono text-[10px] uppercase text-rose-600 dark:text-rose-400 font-medium">Historical Spend Risk</div>
              <div className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400">{current.leakRate}</div>
            </div>
          </div>

          {/* Natural 3-Card Rule Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {current.checks.map((c, j) => (
              <div
                key={j}
                className="p-5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-foreground/20 transition-all duration-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-foreground leading-snug">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {c.detail}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.auditAction}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
