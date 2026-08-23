import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";
import { normalizeDashboardSummary } from "@/lib/api/adapters/dashboard-adapter";

export const dynamic = "force-dynamic";

const JSON_CONTENT = "application/json";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    const resolvedParams = await context.params;
    const path = resolvedParams.path.join("/");

    // Preserve the original body exactly: multipart/form-data must keep its
    // boundary, so it is re-sent as FormData rather than drained to text.
    const originalContentType = req.headers.get("content-type");
    let upstreamBody: BodyInit | null = null;
    let contentType: string | null = originalContentType;

    if (!["GET", "HEAD"].includes(req.method)) {
      if (originalContentType?.includes("multipart/form-data")) {
        upstreamBody = await req.formData();
        contentType = null; // let fetch regenerate the boundary
      } else {
        upstreamBody = await req.text();
      }
    }

    // 1. Query parameters
    const queryString = req.nextUrl.searchParams.toString();
    const targetPath = queryString ? `${path}?${queryString}` : path;

    // 2. Forward to the Go backend
    const backendResult = await tryFetchBackend(targetPath, {
      method: req.method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: upstreamBody,
      contentType,
    });

    // Network-level failure (unreachable / timeout)
    if (backendResult.status === 0) {
      return NextResponse.json(
        { error: { code: "SERVICE_UNAVAILABLE", message: "Deployed API backend is unreachable" } },
        { status: 503 }
      );
    }

    const dataIsEmpty =
      backendResult.data === null ||
      backendResult.data === undefined ||
      (typeof backendResult.data === "object" &&
        !Array.isArray(backendResult.data) &&
        Object.keys(backendResult.data).length === 0);

    if (backendResult.ok) {
      if (path === "dashboard/summary") {
        return NextResponse.json(normalizeDashboardSummary(backendResult.data), {
          status: backendResult.status,
        });
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
      if (listEndpoints.some((ep) => path.startsWith(ep)) && dataIsEmpty) {
        return NextResponse.json([], { status: backendResult.status });
      }
      if (!dataIsEmpty) {
        return NextResponse.json(backendResult.data, { status: backendResult.status });
      }
      return new NextResponse(null, { status: backendResult.status });
    }

    // Backend responded with an HTTP error — pass the payload through verbatim
    const errorPayload = backendResult.data || {
      error: {
        code: "BACKEND_ERROR",
        message: `Backend returned status ${backendResult.status}`,
      },
    };
    return NextResponse.json(errorPayload, { status: backendResult.status });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_PROXY_ERROR", message: "Failed to proxy request to backend" } },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
