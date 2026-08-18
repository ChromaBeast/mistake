"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardSummary } from "@/types";
import { KpiSummaryGrid } from "@/components/dashboard/KpiSummaryGrid";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { LeakageCategoryChart } from "@/components/dashboard/LeakageCategoryChart";
import { DiscrepancyTrendChart } from "@/components/dashboard/DiscrepancyTrendChart";
import { RecentFindingsList } from "@/components/dashboard/RecentFindingsList";
import { Button } from "@/components/ui/Button";
import { DashboardSkeleton } from "@/components/ui/skeletons/DashboardSkeleton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RefreshCw, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ErrorBoundary fallbackTitle="Could not load business health dashboard">
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadData}
              className="text-xs underline ml-4 hover:opacity-75 transition-opacity"
              aria-label="Retry loading dashboard"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
              <span>Business Health Dashboard</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time financial leakage, contradiction risks, and PO-invoice reconciliation overview.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            isLoading={isLoading}
            className="flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Metrics</span>
          </Button>
        </div>

        {isLoading || !summary ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6 animate-fade-in">
            <KpiSummaryGrid kpi={summary.kpi_summary} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <HealthScoreGauge healthScore={summary.health_score} />
              </div>
              <div className="lg:col-span-2">
                <LeakageCategoryChart categories={summary.leakage_by_category} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DiscrepancyTrendChart data={summary.trend_data} />
              <RecentFindingsList findings={summary.recent_findings} />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
