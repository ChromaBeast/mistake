import { describe, it, expect } from "vitest";
import { MockApiClient } from "./mock";

describe("MockApiClient Unit Tests", () => {
  const client = new MockApiClient();

  it("fetches dashboard summary with valid KPIs and categories", async () => {
    const summary = await client.getDashboardSummary();
    expect(summary).toBeDefined();
    expect(summary.kpi_summary.total_leakage_minor).toBeGreaterThan(0);
    expect(summary.leakage_by_category.length).toBeGreaterThan(0);
  });

  it("fetches mistakes list and filters by id", async () => {
    const mistakes = await client.getMistakes();
    expect(mistakes.length).toBeGreaterThan(0);

    const first = mistakes[0];
    const single = await client.getMistake(first.id);
    expect(single.id).toBe(first.id);
    expect(single.entity_name).toBe(first.entity_name);
  });

  it("updates mistake status and records transition", async () => {
    const updated = await client.updateMistakeStatus(
      "mst-001",
      "verified",
      "Confirmed discrepancy with plant supervisor"
    );
    expect(updated.status).toBe("verified");
    expect(updated.transitions?.length).toBeGreaterThan(0);
  });

  it("assigns mistake to user", async () => {
    const assigned = await client.assignMistake("mst-001", "usr-demo-02");
    expect(assigned.assigned_to_user_id).toBe("usr-demo-02");
  });

  it("performs login and returns user with tenant", async () => {
    const res = await client.login({
      email: "aditya@bharatheavyeng.in",
      password: "password123",
    });
    expect(res.user.email).toBe("aditya@bharatheavyeng.in");
    expect(res.tenant.id).toBeDefined();
  });
});
