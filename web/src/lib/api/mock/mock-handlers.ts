import { DashboardSummary, SearchResponse } from "@/types";
import { MockDataStore } from "./mock-store";

export function buildDashboardSummary(store: MockDataStore): DashboardSummary {
  const totalLeaks = store.mistakes.reduce((acc, m) => acc + m.financial_impact_minor, 0);
  return {
    health_score: {
      score: 84,
      status: "healthy",
      risk_drivers: ["Quantity variance in metal procurement", "Orphan spare part invoices"],
      total_leaks_count: store.mistakes.length,
    },
    kpi_summary: {
      total_leakage_minor: totalLeaks,
      open_contradictions_count: store.mistakes.filter((m) => m.status !== "resolved").length,
      high_risk_orders_count: 3,
      missing_evidence_count: 1,
      value_protected_minor: 34000000,
      resolution_rate_percent: 68,
    },
    leakage_by_category: [
      { type: "quantity_mismatch", label: "Quantity Mismatches", leakage_minor: 25000000, percentage: 12, count: 1, color: "#EF4444" },
      { type: "price_mismatch", label: "Price / Freight Overcharges", leakage_minor: 18000000, percentage: 9, count: 1, color: "#F59E0B" },
      { type: "missing_evidence", label: "Missing Inward GRN Evidence", leakage_minor: 125000000, percentage: 61, count: 1, color: "#EC4899" },
      { type: "date_mismatch", label: "SLA / Delivery Delays", leakage_minor: 7500000, percentage: 4, count: 1, color: "#6366F1" },
      { type: "status_mismatch", label: "Status Contradictions", leakage_minor: 34000000, percentage: 14, count: 1, color: "#10B981" },
    ],
    trend_data: [
      { date: "Aug 11", detected_paise: 34000000, resolved_paise: 0, leakage_count: 1 },
      { date: "Aug 13", detected_paise: 41500000, resolved_paise: 34000000, leakage_count: 2 },
      { date: "Aug 15", detected_paise: 166500000, resolved_paise: 34000000, leakage_count: 4 },
      { date: "Aug 17", detected_paise: 209500000, resolved_paise: 34000000, leakage_count: 5 },
    ],
    recent_findings: store.mistakes.slice(0, 5),
  };
}

export function buildSearchResponse(store: MockDataStore, query: string): SearchResponse {
  const q = query.toLowerCase();
  const results: SearchResponse["results"] = [];

  for (const m of store.mistakes) {
    if (m.title.toLowerCase().includes(q) || m.entity_name.toLowerCase().includes(q)) {
      results.push({
        id: m.id,
        type: "mistake",
        title: m.title,
        subtitle: `${m.entity_name} • ${m.type}`,
        financial_impact_minor: m.financial_impact_minor,
        status: m.status,
        url: `/workspace/${m.id}`,
        badge: m.severity,
      });
    }
  }

  for (const e of store.entities) {
    if (e.canonical_name.toLowerCase().includes(q) || e.gstin?.toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        type: "entity",
        title: e.canonical_name,
        subtitle: `GSTIN: ${e.gstin || "N/A"} • ${e.type}`,
        url: `/entities/${e.id}`,
        badge: e.type,
      });
    }
  }

  return {
    query,
    total_results: results.length,
    results,
    facets: {
      type: [
        { field: "type", label: "Mistakes", count: results.filter((r) => r.type === "mistake").length },
        { field: "type", label: "Entities", count: results.filter((r) => r.type === "entity").length },
      ],
    },
  };
}
