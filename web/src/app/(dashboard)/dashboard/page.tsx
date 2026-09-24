"use client";

import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { DashboardSummary } from "@/types";
import { normalizeDashboardSummary } from "@/lib/api/adapters/dashboard-adapter";
import { KpiSummaryGrid } from "@/components/dashboard/KpiSummaryGrid";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { LeakageCategoryChart } from "@/components/dashboard/LeakageCategoryChart";
import { DiscrepancyTrendChart } from "@/components/dashboard/DiscrepancyTrendChart";
import { RecentFindingsList } from "@/components/dashboard/RecentFindingsList";
import { Button } from "@/components/ui/Button";
import { DashboardSkeleton } from "@/components/ui/skeletons/DashboardSkeleton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RefreshCw, AlertTriangle, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const loadData = async () => {
    const seq = ++requestSeqRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const [rawSummary, mistakesList] = await Promise.all([
        api.getDashboardSummary(),
        api.getMistakes(),
      ]);
      if (seq !== requestSeqRef.current) return; // stale response
      setSummary(normalizeDashboardSummary(rawSummary as never, mistakesList));
    } catch (err: unknown) {
      console.error(err);
      if (seq !== requestSeqRef.current) return;
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ErrorBoundary fallbackTitle="Could not load business health dashboard">
      <div className="mx-auto max-w-[1440px] space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Spend at risk and the latest findings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> Current overview
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={loadData}
              isLoading={isLoading}
              disabled={isLoading}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {error && !isLoading && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="truncate">{error}</span>
            </span>
            <button
              onClick={loadData}
              className="text-xs underline underline-offset-2 hover:opacity-75 transition-opacity shrink-0"
              aria-label="Retry loading dashboard"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading || !summary ? (
          error && summary ? (
            // Show stale data beneath the error banner rather than flashing a skeleton
            <DashboardData summary={summary} />
          ) : (
            <DashboardSkeleton />
          )
        ) : (
          <DashboardData summary={summary} />
        )}
      </div>
    </ErrorBoundary>
  );
}

function DashboardData({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <KpiSummaryGrid kpi={summary.kpi_summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <HealthScoreGauge healthScore={summary.health_score} />
        </div>
        <div className="lg:col-span-2">
          <LeakageCategoryChart categories={summary.leakage_by_category} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DiscrepancyTrendChart data={summary.trend_data} />
        <RecentFindingsList findings={summary.recent_findings} />
      </div>
    </div>
  );
}
