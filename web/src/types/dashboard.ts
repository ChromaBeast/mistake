import { Mistake } from "./mistake";

export interface HealthScore {
  score: number; // 0 to 100
  status: "healthy" | "moderate" | "critical";
  risk_drivers: string[];
  total_leaks_count: number;
}

export interface KpiSummary {
  total_leakage_minor: number;
  open_contradictions_count: number;
  high_risk_orders_count: number;
  missing_evidence_count: number;
  value_protected_minor: number;
  resolution_rate_percent: number;
}

export interface LeakageCategory {
  type: string;
  label: string;
  leakage_minor: number;
  percentage: number;
  count: number;
  color: string;
}

export interface DiscrepancyTrendPoint {
  date: string;
  detected_paise: number;
  resolved_paise: number;
  leakage_count: number;
}

export interface DashboardSummary {
  health_score: HealthScore;
  kpi_summary: KpiSummary;
  leakage_by_category: LeakageCategory[];
  trend_data: DiscrepancyTrendPoint[];
  recent_findings: Mistake[];
}
