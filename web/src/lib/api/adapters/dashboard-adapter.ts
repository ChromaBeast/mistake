import { DashboardSummary, KpiSummary, HealthScore, LeakageCategory, DiscrepancyTrendPoint, Mistake } from "@/types";

export interface BackendDashboardRaw {
  total_value_at_risk_minor?: number;
  total_discrepancies?: number;
  active_mistakes?: number;
  resolved_mistakes?: number;
  by_severity?: Record<string, number>;
  by_status?: Record<string, number>;
  by_type?: Record<string, number>;
  monthly_leakage_trend?: Array<{ month: string; amount_minor: number; count: number }> | null;
  health_score?: HealthScore;
  kpi_summary?: KpiSummary;
  leakage_by_category?: LeakageCategory[];
  trend_data?: DiscrepancyTrendPoint[];
  recent_findings?: Mistake[];
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  quantity_mismatch: { label: "Quantity Mismatches", color: "#EF4444" },
  price_mismatch: { label: "Price / Freight Overcharges", color: "#F59E0B" },
  missing_evidence: { label: "Missing Inward GRN Evidence", color: "#EC4899" },
  date_mismatch: { label: "SLA / Delivery Delays", color: "#6366F1" },
  status_mismatch: { label: "Status Contradictions", color: "#10B981" },
  duplicate_billing: { label: "Duplicate Billing", color: "#8B5CF6" },
  tax_mismatch: { label: "GST / HSN Tax Variances", color: "#06B6D4" },
};

export function normalizeDashboardSummary(
  raw: BackendDashboardRaw | null | undefined,
  fallbackMistakes: Mistake[] = []
): DashboardSummary {
  if (!raw) {
    return createEmptyDashboardSummary();
  }

  // If already formatted with frontend schema
  if (raw.kpi_summary && raw.health_score) {
    return {
      health_score: {
        score: raw.health_score.score ?? 100,
        status: raw.health_score.status ?? "healthy",
        risk_drivers: raw.health_score.risk_drivers ?? [],
        total_leaks_count: raw.health_score.total_leaks_count ?? 0,
      },
      kpi_summary: {
        total_leakage_minor: raw.kpi_summary.total_leakage_minor ?? 0,
        open_contradictions_count: raw.kpi_summary.open_contradictions_count ?? 0,
        high_risk_orders_count: raw.kpi_summary.high_risk_orders_count ?? 0,
        missing_evidence_count: raw.kpi_summary.missing_evidence_count ?? 0,
        value_protected_minor: raw.kpi_summary.value_protected_minor ?? 0,
        resolution_rate_percent: raw.kpi_summary.resolution_rate_percent ?? 100,
      },
      leakage_by_category: raw.leakage_by_category ?? [],
      trend_data: raw.trend_data ?? [],
      recent_findings: raw.recent_findings ?? fallbackMistakes,
    };
  }

  const totalValue = raw.total_value_at_risk_minor ?? 0;
  const totalDiscrepancies = raw.total_discrepancies ?? 0;
  const activeMistakes = raw.active_mistakes ?? 0;
  const resolvedMistakes = raw.resolved_mistakes ?? 0;
  const bySeverity = raw.by_severity ?? {};
  const byType = raw.by_type ?? {};

  const highRisk = (bySeverity.critical || 0) + (bySeverity.high || 0);
  const missingEv = byType.missing_evidence || 0;
  const resolutionRate = totalDiscrepancies > 0 ? Math.round((resolvedMistakes / totalDiscrepancies) * 100) : 100;
  const protectedVal = resolvedMistakes > 0 ? Math.round(totalValue * (resolvedMistakes / totalDiscrepancies)) : 0;

  // Build Health Score
  const scoreDeductions = activeMistakes * 6 + (bySeverity.critical || 0) * 15;
  const score = totalDiscrepancies === 0 ? 100 : Math.max(15, Math.min(98, 100 - scoreDeductions));
  const healthStatus: HealthScore["status"] = score >= 80 ? "healthy" : score >= 50 ? "moderate" : "critical";

  const riskDrivers: string[] = [];
  if (byType.quantity_mismatch) riskDrivers.push("Quantity variance across purchase orders");
  if (byType.price_mismatch) riskDrivers.push("Rate discrepancy vs supplier contracts");
  if (byType.missing_evidence) riskDrivers.push("Missing Gate Inward / GRN evidence");
  if (byType.date_mismatch) riskDrivers.push("SLA delivery and penalty date delays");
  if (riskDrivers.length === 0) riskDrivers.push("All monitored accounts within normal tolerance");

  // Aggregate from live database findings if available
  const categoryAmounts: Record<string, number> = {};
  const monthlyBuckets: Record<string, { detected: number; resolved: number; count: number }> = {};

  for (const m of fallbackMistakes) {
    categoryAmounts[m.type] = (categoryAmounts[m.type] || 0) + (m.financial_impact_minor || 0);

    const d = new Date(m.detected_at);
    const monthKey = isNaN(d.getTime())
      ? "Current"
      : d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

    if (!monthlyBuckets[monthKey]) {
      monthlyBuckets[monthKey] = { detected: 0, resolved: 0, count: 0 };
    }
    monthlyBuckets[monthKey].detected += m.financial_impact_minor || 0;
    monthlyBuckets[monthKey].count += 1;
    if (m.status === "resolved") {
      monthlyBuckets[monthKey].resolved += m.financial_impact_minor || 0;
    }
  }

  // Build Category Breakdown
  const categories: LeakageCategory[] = [];
  const typeKeys = Object.keys(byType);
  const totalTypeCount = typeKeys.reduce((acc, k) => acc + (byType[k] || 0), 0);

  for (const [t, count] of Object.entries(byType)) {
    const meta = CATEGORY_META[t] || { label: t.replace(/_/g, " "), color: "#94A3B8" };
    const pct = totalTypeCount > 0 ? Math.round((count / totalTypeCount) * 100) : 0;
    const catAmount =
      categoryAmounts[t] ?? (totalTypeCount > 0 ? Math.round((totalValue * count) / totalTypeCount) : 0);

    categories.push({
      type: t,
      label: meta.label,
      leakage_minor: catAmount,
      percentage: pct,
      count,
      color: meta.color,
    });
  }

  // Build Trend Points from live months or backend trend
  let trendData: DiscrepancyTrendPoint[] = [];
  if (raw.monthly_leakage_trend && raw.monthly_leakage_trend.length > 0) {
    trendData = raw.monthly_leakage_trend.map((m) => ({
      date: m.month,
      detected_paise: m.amount_minor,
      resolved_paise: 0,
      leakage_count: m.count,
    }));
  } else if (Object.keys(monthlyBuckets).length > 0) {
    trendData = Object.entries(monthlyBuckets).map(([date, b]) => ({
      date,
      detected_paise: b.detected,
      resolved_paise: b.resolved,
      leakage_count: b.count,
    }));
  } else {
    trendData = [
      { date: "Current", detected_paise: totalValue, resolved_paise: protectedVal, leakage_count: totalDiscrepancies },
    ];
  }

  const sortedFindings = [...fallbackMistakes].sort(
    (a, b) => (b.financial_impact_minor || 0) - (a.financial_impact_minor || 0)
  );

  return {
    health_score: {
      score,
      status: healthStatus,
      risk_drivers: riskDrivers,
      total_leaks_count: totalDiscrepancies,
    },
    kpi_summary: {
      total_leakage_minor: totalValue,
      open_contradictions_count: activeMistakes,
      high_risk_orders_count: highRisk,
      missing_evidence_count: missingEv,
      value_protected_minor: protectedVal,
      resolution_rate_percent: resolutionRate,
    },
    leakage_by_category: categories,
    trend_data: trendData,
    recent_findings: raw.recent_findings ?? sortedFindings,
  };
}

export function createEmptyDashboardSummary(): DashboardSummary {
  return {
    health_score: {
      score: 100,
      status: "healthy",
      risk_drivers: ["No active discrepancies detected"],
      total_leaks_count: 0,
    },
    kpi_summary: {
      total_leakage_minor: 0,
      open_contradictions_count: 0,
      high_risk_orders_count: 0,
      missing_evidence_count: 0,
      value_protected_minor: 0,
      resolution_rate_percent: 100,
    },
    leakage_by_category: [],
    trend_data: [{ date: "Current", detected_paise: 0, resolved_paise: 0, leakage_count: 0 }],
    recent_findings: [],
  };
}
