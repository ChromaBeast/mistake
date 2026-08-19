import { describe, it, expect } from "vitest";
import { normalizeDashboardSummary, createEmptyDashboardSummary } from "./dashboard-adapter";

describe("Dashboard Adapter", () => {
  it("normalizes real Go backend JSON payload correctly", () => {
    const rawGoBackend = {
      total_value_at_risk_minor: 56000000,
      total_discrepancies: 4,
      active_mistakes: 4,
      resolved_mistakes: 0,
      by_severity: { critical: 2, high: 1, medium: 1 },
      by_status: { detected: 4 },
      by_type: {
        date_mismatch: 1,
        missing_evidence: 1,
        price_mismatch: 1,
        quantity_mismatch: 1,
      },
      monthly_leakage_trend: null,
    };

    const summary = normalizeDashboardSummary(rawGoBackend);

    expect(summary.kpi_summary).toBeDefined();
    expect(summary.kpi_summary.total_leakage_minor).toBe(56000000);
    expect(summary.kpi_summary.open_contradictions_count).toBe(4);
    expect(summary.kpi_summary.high_risk_orders_count).toBe(3); // critical + high
    expect(summary.kpi_summary.missing_evidence_count).toBe(1);

    expect(summary.health_score).toBeDefined();
    expect(summary.health_score.total_leaks_count).toBe(4);
    expect(summary.health_score.risk_drivers.length).toBeGreaterThan(0);

    expect(summary.leakage_by_category.length).toBe(4);
    expect(summary.trend_data.length).toBeGreaterThan(0);
    expect(Array.isArray(summary.recent_findings)).toBe(true);
  });

  it("handles null/undefined gracefully without throwing", () => {
    const emptySummary = normalizeDashboardSummary(null);
    expect(emptySummary.kpi_summary.total_leakage_minor).toBe(0);
    expect(emptySummary.health_score.score).toBe(100);
    expect(emptySummary.leakage_by_category).toEqual([]);
    expect(emptySummary.trend_data.length).toBe(1);
    expect(emptySummary.recent_findings).toEqual([]);
  });

  it("preserves already-normalized frontend DashboardSummary", () => {
    const validSummary = {
      health_score: {
        score: 92,
        status: "healthy" as const,
        risk_drivers: ["Minor variance"],
        total_leaks_count: 1,
      },
      kpi_summary: {
        total_leakage_minor: 1200000,
        open_contradictions_count: 1,
        high_risk_orders_count: 0,
        missing_evidence_count: 0,
        value_protected_minor: 5000000,
        resolution_rate_percent: 85,
      },
      leakage_by_category: [],
      trend_data: [],
      recent_findings: [],
    };

    const res = normalizeDashboardSummary(validSummary);
    expect(res.kpi_summary.total_leakage_minor).toBe(1200000);
    expect(res.health_score.score).toBe(92);
  });
});
