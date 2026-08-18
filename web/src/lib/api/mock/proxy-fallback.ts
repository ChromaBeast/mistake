import { NextRequest } from "next/server";
import { getServerMock } from "../server-api";

export async function handleMockProxyFallback(req: NextRequest, path: string, bodyJson: any): Promise<{ status: number; data: any }> {
  const mock = getServerMock();
  const method = req.method.toUpperCase();
  const searchParams = req.nextUrl.searchParams;

  try {
    // 1. Dashboard
    if (path === "dashboard/summary") {
      const summary = await mock.getDashboardSummary();
      return { status: 200, data: summary };
    }

    // 2. Mistakes / Investigation Workspace
    if (path === "mistakes") {
      const status = searchParams.get("status") || undefined;
      const type = searchParams.get("type") || undefined;
      const severity = searchParams.get("severity") || undefined;
      const list = await mock.getMistakes({ status, type, severity });
      return { status: 200, data: { mistakes: list, total: list.length } };
    }

    if (path.startsWith("mistakes/")) {
      const parts = path.split("/");
      const mistakeId = parts[1];
      if (parts.length === 2) {
        const item = await mock.getMistake(mistakeId);
        return { status: 200, data: item };
      }
      if (parts[2] === "status" && method === "PATCH") {
        const item = await mock.updateMistakeStatus(mistakeId, bodyJson?.status, bodyJson?.reason);
        return { status: 200, data: item };
      }
      if (parts[2] === "assign" && method === "PATCH") {
        const item = await mock.assignMistake(mistakeId, bodyJson?.user_id);
        return { status: 200, data: item };
      }
    }

    // 3. Tenant & Team
    if (path === "tenant") {
      if (method === "PATCH") {
        const t = await mock.updateTenant(bodyJson || {});
        return { status: 200, data: t };
      }
      const t = await mock.getTenant();
      return { status: 200, data: t };
    }

    if (path === "users") {
      const users = await mock.getUsers();
      return { status: 200, data: { users } };
    }

    if (path === "users/invite" && method === "POST") {
      const member = await mock.inviteUser(bodyJson || {});
      return { status: 201, data: member };
    }

    // 4. Data Sources / Ingestion
    if (path === "datasources") {
      if (method === "POST") {
        const ds = await mock.uploadDataSource(bodyJson || { name: "Manual Upload.csv", size: 1024, format: "csv" });
        return { status: 201, data: ds };
      }
      const dataSources = await mock.getDataSources();
      return { status: 200, data: { data_sources: dataSources } };
    }

    if (path.startsWith("datasources/")) {
      const dsId = path.split("/")[1];
      const ds = await mock.getDataSource(dsId);
      return { status: 200, data: ds };
    }

    // 5. Canonical Entities & Review Queue
    if (path === "entities") {
      const type = searchParams.get("type") || undefined;
      const q = searchParams.get("q") || undefined;
      const entities = await mock.getEntities({ type, q });
      return { status: 200, data: { entities, total: entities.length } };
    }

    if (path === "entities/review-queue") {
      const queue = await mock.getReviewQueue();
      return { status: 200, data: { items: queue } };
    }

    if (path.startsWith("entities/")) {
      const parts = path.split("/");
      const entityId = parts[1];
      if (parts.length === 2) {
        const entity = await mock.getEntity(entityId);
        return { status: 200, data: entity };
      }
      if (parts[2] === "timeline") {
        const timeline = await mock.getEntityTimeline(entityId);
        return { status: 200, data: { events: timeline } };
      }
    }

    // 6. Search
    if (path === "search") {
      const q = searchParams.get("q") || "";
      const searchRes = await mock.search(q);
      return { status: 200, data: searchRes };
    }

    // 7. Audit & Settings
    if (path === "audit") {
      const logs = await mock.getAuditLogs();
      return { status: 200, data: { audit_logs: logs } };
    }

    if (path === "settings/retention") {
      const policies = await mock.getRetentionPolicies();
      return { status: 200, data: { policies } };
    }

    if (path === "subscription") {
      const sub = await mock.getSubscription();
      return { status: 200, data: sub };
    }

    if (path === "invoices") {
      const invs = await mock.getInvoices();
      return { status: 200, data: { invoices: invs } };
    }

    return { status: 200, data: { success: true, fallback: true } };
  } catch (err: any) {
    return { status: 200, data: { success: true, message: err?.message || "Processed in demo mode" } };
  }
}
