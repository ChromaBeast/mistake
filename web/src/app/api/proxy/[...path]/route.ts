import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";
import { handleMockProxyFallback } from "@/lib/api/mock/proxy-fallback";
import { normalizeDashboardSummary } from "@/lib/api/adapters/dashboard-adapter";

export const dynamic = "force-dynamic";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    const resolvedParams = await context.params;
    const path = resolvedParams.path.join("/");

    let bodyText: string | undefined;
    let bodyJson: any = undefined;

    if (!["GET", "HEAD"].includes(req.method)) {
      bodyText = await req.text();
      try {
        bodyJson = bodyText ? JSON.parse(bodyText) : undefined;
      } catch {}
    }

    // 1. Query parameters
    const queryString = req.nextUrl.searchParams.toString();
    const targetPath = queryString ? `${path}?${queryString}` : path;

    // 2. Try real Go Backend
    const backendResult = await tryFetchBackend(targetPath, {
      method: req.method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: bodyText,
    });

    if (backendResult.ok) {
      if (path === "dashboard/summary") {
        return NextResponse.json(normalizeDashboardSummary(backendResult.data), { status: backendResult.status });
      }
      const listEndpoints = [
        "data-sources",
        "entities",
        "audit-logs",
        "mistakes",
        "users",
        "retention-policy",
        "billing/invoices",
        "entities/review-queue",
        "search",
        "notifications",
      ];
      if (listEndpoints.some((ep) => path.startsWith(ep)) && backendResult.data === null) {
        return NextResponse.json([], { status: backendResult.status });
      }
      return NextResponse.json(backendResult.data ?? {}, { status: backendResult.status });
    }

    // If backend returned any HTTP status (client error or server error), return it directly
    if (backendResult.status && backendResult.status > 0) {
      const errorPayload = backendResult.data || {
        error: {
          code: "BACKEND_ERROR",
          message: `Backend returned status ${backendResult.status}`,
        },
      };
      return NextResponse.json(errorPayload, { status: backendResult.status });
    }

    // If explicit demo token session was used and network completely unreachable
    if (token === "demo-token-session") {
      const fallbackResult = await handleMockProxyFallback(req, path, bodyJson);
      return NextResponse.json(fallbackResult.data, { status: fallbackResult.status });
    }

    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Deployed API backend is unreachable" } },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_PROXY_ERROR", message: err?.message || "Failed to proxy request to backend" } },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
